from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import secrets
import bcrypt
import jwt
import httpx
import pandas as pd
import io
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Response, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# PDF Generation
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
from fastapi.responses import StreamingResponse

# Constants
JWT_ALGORITHM = "HS256"
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

# MongoDB client
mongo_client: AsyncIOMotorClient = None
db = None

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=2),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    """Extract and validate user from token (cookie or header)"""
    token = request.cookies.get("access_token")
    if not token:
        # Try session_token for Google OAuth
        token = request.cookies.get("session_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if it's a JWT token (email/password auth)
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") == "access":
            user = await db.users.find_one({"_id": ObjectId(payload["sub"])}, {"_id": 0, "password_hash": 0})
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
            user["user_id"] = payload["sub"]
            return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        pass
    
    # Check if it's a session token (Google OAuth)
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if session:
        expires_at = session.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        
        user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    
    raise HTTPException(status_code=401, detail="Invalid token")

async def seed_admin():
    """Seed admin user on startup"""
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@syntra.app")
    admin_password = os.environ.get("ADMIN_PASSWORD", "SyntraAdmin123!")
    
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "user_id": user_id,
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc)
        })
        print(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        print(f"Admin password updated: {admin_email}")
    
    # Write credentials to test_credentials.md
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Syntra Test Credentials\n\n")
        f.write("## Admin Account\n")
        f.write(f"- Email: {admin_email}\n")
        f.write(f"- Password: {admin_password}\n")
        f.write("- Role: admin\n\n")
        f.write("## Auth Endpoints\n")
        f.write("- POST /api/auth/register\n")
        f.write("- POST /api/auth/login\n")
        f.write("- POST /api/auth/logout\n")
        f.write("- GET /api/auth/me\n")
        f.write("- POST /api/auth/refresh\n")
        f.write("- POST /api/auth/session (Google OAuth)\n")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global mongo_client, db
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "syntra")
    
    mongo_client = AsyncIOMotorClient(mongo_url)
    db = mongo_client[db_name]
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True, sparse=True)
    await db.user_sessions.create_index("session_token")
    await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)
    await db.login_attempts.create_index("identifier")
    await db.contacts.create_index("user_id")
    await db.invoices.create_index("user_id")
    await db.automations.create_index("user_id")
    await db.activities.create_index([("user_id", 1), ("created_at", -1)])
    await db.excel_data.create_index("user_id")
    
    await seed_admin()
    
    yield
    
    mongo_client.close()

app = FastAPI(title="Syntra API", lifespan=lifespan)

# CORS
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SessionRequest(BaseModel):
    session_id: str

class ContactCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    status: str = "Lead"
    notes: Optional[str] = None
    company: Optional[str] = None

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    company: Optional[str] = None

class InvoiceItem(BaseModel):
    name: str
    quantity: float
    price: float
    hsn_code: Optional[str] = None

class InvoiceCreate(BaseModel):
    client_name: str
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    client_gstin: Optional[str] = None
    client_address: Optional[str] = None
    items: List[InvoiceItem]
    tax_type: str = "intra"  # intra (CGST+SGST) or inter (IGST)
    due_date: Optional[str] = None
    notes: Optional[str] = None

class AutomationCreate(BaseModel):
    name: str
    trigger_type: str  # new_row, row_updated, status_change
    trigger_condition: Optional[dict] = None
    action_type: str  # create_invoice, update_crm, send_whatsapp
    action_config: Optional[dict] = None
    is_active: bool = True

class WhatsAppMessage(BaseModel):
    contact_id: str
    template: str
    custom_message: Optional[str] = None

# Health Check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# ============ AUTH ENDPOINTS ============

@app.post("/api/auth/register")
async def register(user: UserRegister, response: Response):
    email = user.email.lower().strip()
    
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed = hash_password(user.password)
    
    result = await db.users.insert_one({
        "user_id": user_id,
        "email": email,
        "password_hash": hashed,
        "name": user.name,
        "role": "user",
        "created_at": datetime.now(timezone.utc)
    })
    
    access_token = create_access_token(str(result.inserted_id), email)
    refresh_token = create_refresh_token(str(result.inserted_id))
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=7200, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    # Log activity
    await db.activities.insert_one({
        "user_id": user_id,
        "type": "user_registered",
        "message": f"Welcome to Syntra, {user.name}!",
        "created_at": datetime.now(timezone.utc)
    })
    
    return {
        "user_id": user_id,
        "email": email,
        "name": user.name,
        "role": "user"
    }

@app.post("/api/auth/login")
async def login(user: UserLogin, request: Request, response: Response):
    email = user.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    
    # Check brute force
    attempts = await db.login_attempts.find_one({"identifier": identifier})
    if attempts and attempts.get("count", 0) >= MAX_LOGIN_ATTEMPTS:
        lockout_until = attempts.get("locked_until")
        if lockout_until:
            if isinstance(lockout_until, str):
                lockout_until = datetime.fromisoformat(lockout_until)
            if lockout_until.tzinfo is None:
                lockout_until = lockout_until.replace(tzinfo=timezone.utc)
            if lockout_until > datetime.now(timezone.utc):
                raise HTTPException(status_code=429, detail="Too many failed attempts. Try again later.")
            else:
                await db.login_attempts.delete_one({"identifier": identifier})
    
    db_user = await db.users.find_one({"email": email})
    if not db_user or not verify_password(user.password, db_user.get("password_hash", "")):
        # Increment failed attempts
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {
                "$inc": {"count": 1},
                "$set": {"locked_until": datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)}
            },
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Clear failed attempts
    await db.login_attempts.delete_one({"identifier": identifier})
    
    user_id = str(db_user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=7200, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "user_id": db_user.get("user_id", user_id),
        "email": db_user["email"],
        "name": db_user.get("name", "User"),
        "role": db_user.get("role", "user")
    }

@app.post("/api/auth/session")
async def google_session(session_req: SessionRequest, response: Response):
    """Handle Google OAuth session from Emergent Auth"""
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_req.session_id}
            )
            if res.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            data = res.json()
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth service error: {str(e)}")
    
    email = data.get("email", "").lower()
    name = data.get("name", "User")
    picture = data.get("picture", "")
    session_token = data.get("session_token")
    
    # Find or create user
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing.get("user_id")
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "picture": picture, "updated_at": datetime.now(timezone.utc)}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "role": "user",
            "auth_provider": "google",
            "created_at": datetime.now(timezone.utc)
        })
        # Log activity
        await db.activities.insert_one({
            "user_id": user_id,
            "type": "user_registered",
            "message": f"Welcome to Syntra, {name}!",
            "created_at": datetime.now(timezone.utc)
        })
    
    # Store session
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=604800,
        path="/"
    )
    
    return {
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "role": "user"
    }

@app.get("/api/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out successfully"}

@app.post("/api/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        access_token = create_access_token(payload["sub"], user["email"])
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=7200, path="/")
        
        return {"message": "Token refreshed"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# ============ EXCEL UPLOAD ============

@app.post("/api/excel/upload")
async def upload_excel(request: Request, file: UploadFile = File(...)):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Please upload Excel (.xlsx, .xls) or CSV file")
    
    contents = await file.read()
    
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
    
    # Convert to records
    records = df.to_dict(orient='records')
    columns = list(df.columns)
    
    # Store in database
    excel_doc = {
        "user_id": user_id,
        "filename": file.filename,
        "columns": columns,
        "rows": records,
        "row_count": len(records),
        "uploaded_at": datetime.now(timezone.utc),
        "last_synced": datetime.now(timezone.utc)
    }
    
    result = await db.excel_data.insert_one(excel_doc)
    
    # Log activity
    await db.activities.insert_one({
        "user_id": user_id,
        "type": "excel_uploaded",
        "message": f"Uploaded {file.filename} with {len(records)} rows",
        "metadata": {"file_id": str(result.inserted_id), "filename": file.filename},
        "created_at": datetime.now(timezone.utc)
    })
    
    return {
        "file_id": str(result.inserted_id),
        "filename": file.filename,
        "columns": columns,
        "row_count": len(records),
        "sample_rows": records[:5] if len(records) > 0 else []
    }

@app.get("/api/excel/files")
async def get_excel_files(request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    files = await db.excel_data.find(
        {"user_id": user_id},
        {"_id": 1, "filename": 1, "columns": 1, "row_count": 1, "uploaded_at": 1}
    ).sort("uploaded_at", -1).to_list(100)
    
    for f in files:
        f["file_id"] = str(f.pop("_id"))
    
    return files

@app.get("/api/excel/{file_id}")
async def get_excel_data(file_id: str, request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    file_doc = await db.excel_data.find_one(
        {"_id": ObjectId(file_id), "user_id": user_id},
        {"_id": 0, "user_id": 0}
    )
    
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    return file_doc

@app.delete("/api/excel/{file_id}")
async def delete_excel_file(file_id: str, request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    result = await db.excel_data.delete_one({"_id": ObjectId(file_id), "user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="File not found")
    
    return {"message": "File deleted"}

# ============ CONTACTS / CRM ============

@app.get("/api/contacts")
async def get_contacts(request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    contacts = await db.contacts.find(
        {"user_id": user_id},
        {"_id": 1, "name": 1, "email": 1, "phone": 1, "status": 1, "notes": 1, "company": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(500)
    
    for c in contacts:
        c["contact_id"] = str(c.pop("_id"))
    
    return contacts

@app.post("/api/contacts")
async def create_contact(contact: ContactCreate, request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    contact_doc = {
        "user_id": user_id,
        "name": contact.name,
        "email": contact.email,
        "phone": contact.phone,
        "status": contact.status,
        "notes": contact.notes,
        "company": contact.company,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = await db.contacts.insert_one(contact_doc)
    
    # Log activity
    await db.activities.insert_one({
        "user_id": user_id,
        "type": "contact_created",
        "message": f"Added new contact: {contact.name}",
        "metadata": {"contact_id": str(result.inserted_id)},
        "created_at": datetime.now(timezone.utc)
    })
    
    return {
        "contact_id": str(result.inserted_id),
        "name": contact.name,
        "status": contact.status
    }

@app.put("/api/contacts/{contact_id}")
async def update_contact(contact_id: str, contact: ContactUpdate, request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    update_data = {k: v for k, v in contact.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.contacts.update_one(
        {"_id": ObjectId(contact_id), "user_id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    return {"message": "Contact updated"}

@app.delete("/api/contacts/{contact_id}")
async def delete_contact(contact_id: str, request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    result = await db.contacts.delete_one({"_id": ObjectId(contact_id), "user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    return {"message": "Contact deleted"}

# ============ INVOICES ============

async def generate_invoice_number(user_id: str) -> str:
    """Generate unique invoice number"""
    count = await db.invoices.count_documents({"user_id": user_id})
    year = datetime.now().year
    return f"INV-{year}-{count + 1:04d}"

@app.get("/api/invoices")
async def get_invoices(request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    invoices = await db.invoices.find(
        {"user_id": user_id},
        {"_id": 1, "invoice_number": 1, "client_name": 1, "total_amount": 1, "status": 1, "created_at": 1, "due_date": 1}
    ).sort("created_at", -1).to_list(500)
    
    for inv in invoices:
        inv["invoice_id"] = str(inv.pop("_id"))
    
    return invoices

@app.post("/api/invoices")
async def create_invoice(invoice: InvoiceCreate, request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    invoice_number = await generate_invoice_number(user_id)
    
    # Calculate totals
    subtotal = sum(item.quantity * item.price for item in invoice.items)
    
    if invoice.tax_type == "inter":
        igst = subtotal * 0.18
        cgst = 0
        sgst = 0
    else:
        igst = 0
        cgst = subtotal * 0.09
        sgst = subtotal * 0.09
    
    total_tax = igst + cgst + sgst
    total_amount = subtotal + total_tax
    
    invoice_doc = {
        "user_id": user_id,
        "invoice_number": invoice_number,
        "client_name": invoice.client_name,
        "client_email": invoice.client_email,
        "client_phone": invoice.client_phone,
        "client_gstin": invoice.client_gstin,
        "client_address": invoice.client_address,
        "items": [item.model_dump() for item in invoice.items],
        "tax_type": invoice.tax_type,
        "subtotal": round(subtotal, 2),
        "cgst": round(cgst, 2),
        "sgst": round(sgst, 2),
        "igst": round(igst, 2),
        "total_tax": round(total_tax, 2),
        "total_amount": round(total_amount, 2),
        "due_date": invoice.due_date,
        "notes": invoice.notes,
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = await db.invoices.insert_one(invoice_doc)
    
    # Log activity
    await db.activities.insert_one({
        "user_id": user_id,
        "type": "invoice_created",
        "message": f"Created invoice {invoice_number} for {invoice.client_name}",
        "metadata": {"invoice_id": str(result.inserted_id), "amount": total_amount},
        "created_at": datetime.now(timezone.utc)
    })
    
    return {
        "invoice_id": str(result.inserted_id),
        "invoice_number": invoice_number,
        "total_amount": round(total_amount, 2)
    }

@app.get("/api/invoices/{invoice_id}")
async def get_invoice(invoice_id: str, request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    invoice = await db.invoices.find_one(
        {"_id": ObjectId(invoice_id), "user_id": user_id},
        {"_id": 0, "user_id": 0}
    )
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice["invoice_id"] = invoice_id
    return invoice

@app.put("/api/invoices/{invoice_id}/status")
async def update_invoice_status(invoice_id: str, request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    body = await request.json()
    status = body.get("status", "pending")
    
    result = await db.invoices.update_one(
        {"_id": ObjectId(invoice_id), "user_id": user_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return {"message": "Invoice status updated"}

@app.get("/api/invoices/{invoice_id}/pdf")
async def download_invoice_pdf(invoice_id: str, request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    invoice = await db.invoices.find_one(
        {"_id": ObjectId(invoice_id), "user_id": user_id}
    )
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Generate PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=30, bottomMargin=30)
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, spaceAfter=20, textColor=colors.HexColor('#6366F1'))
    header_style = ParagraphStyle('Header', parent=styles['Normal'], fontSize=12, textColor=colors.HexColor('#475569'))
    
    # Header
    elements.append(Paragraph("INVOICE", title_style))
    elements.append(Paragraph(f"Invoice #: {invoice['invoice_number']}", header_style))
    elements.append(Paragraph(f"Date: {invoice['created_at'].strftime('%Y-%m-%d')}", header_style))
    if invoice.get('due_date'):
        elements.append(Paragraph(f"Due Date: {invoice['due_date']}", header_style))
    elements.append(Spacer(1, 20))
    
    # Client details
    elements.append(Paragraph("<b>Bill To:</b>", styles['Normal']))
    elements.append(Paragraph(invoice['client_name'], styles['Normal']))
    if invoice.get('client_address'):
        elements.append(Paragraph(invoice['client_address'], styles['Normal']))
    if invoice.get('client_gstin'):
        elements.append(Paragraph(f"GSTIN: {invoice['client_gstin']}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Items table
    table_data = [['Item', 'Qty', 'Price', 'Amount']]
    for item in invoice['items']:
        amount = item['quantity'] * item['price']
        table_data.append([
            item['name'],
            str(item['quantity']),
            f"₹{item['price']:,.2f}",
            f"₹{amount:,.2f}"
        ])
    
    table = Table(table_data, colWidths=[3*inch, 0.8*inch, 1.2*inch, 1.2*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366F1')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 20))
    
    # Totals
    totals_data = [
        ['Subtotal:', f"₹{invoice['subtotal']:,.2f}"],
    ]
    if invoice.get('cgst', 0) > 0:
        totals_data.append(['CGST (9%):', f"₹{invoice['cgst']:,.2f}"])
        totals_data.append(['SGST (9%):', f"₹{invoice['sgst']:,.2f}"])
    if invoice.get('igst', 0) > 0:
        totals_data.append(['IGST (18%):', f"₹{invoice['igst']:,.2f}"])
    totals_data.append(['Total:', f"₹{invoice['total_amount']:,.2f}"])
    
    totals_table = Table(totals_data, colWidths=[4.8*inch, 1.4*inch])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LINEABOVE', (0, -1), (-1, -1), 1, colors.HexColor('#6366F1')),
    ]))
    elements.append(totals_table)
    
    if invoice.get('notes'):
        elements.append(Spacer(1, 30))
        elements.append(Paragraph("<b>Notes:</b>", styles['Normal']))
        elements.append(Paragraph(invoice['notes'], styles['Normal']))
    
    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={invoice['invoice_number']}.pdf"}
    )

# ============ AUTOMATIONS ============

@app.get("/api/automations")
async def get_automations(request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    automations = await db.automations.find(
        {"user_id": user_id},
        {"_id": 1, "name": 1, "trigger_type": 1, "action_type": 1, "is_active": 1, "created_at": 1, "run_count": 1}
    ).sort("created_at", -1).to_list(100)
    
    for a in automations:
        a["automation_id"] = str(a.pop("_id"))
    
    return automations

@app.post("/api/automations")
async def create_automation(automation: AutomationCreate, request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    automation_doc = {
        "user_id": user_id,
        "name": automation.name,
        "trigger_type": automation.trigger_type,
        "trigger_condition": automation.trigger_condition,
        "action_type": automation.action_type,
        "action_config": automation.action_config,
        "is_active": automation.is_active,
        "run_count": 0,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = await db.automations.insert_one(automation_doc)
    
    # Log activity
    await db.activities.insert_one({
        "user_id": user_id,
        "type": "automation_created",
        "message": f"Created automation: {automation.name}",
        "metadata": {"automation_id": str(result.inserted_id)},
        "created_at": datetime.now(timezone.utc)
    })
    
    return {
        "automation_id": str(result.inserted_id),
        "name": automation.name
    }

@app.put("/api/automations/{automation_id}")
async def update_automation(automation_id: str, automation: AutomationCreate, request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    update_data = automation.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.automations.update_one(
        {"_id": ObjectId(automation_id), "user_id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    return {"message": "Automation updated"}

@app.put("/api/automations/{automation_id}/toggle")
async def toggle_automation(automation_id: str, request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    automation = await db.automations.find_one({"_id": ObjectId(automation_id), "user_id": user_id})
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    new_status = not automation.get("is_active", True)
    await db.automations.update_one(
        {"_id": ObjectId(automation_id)},
        {"$set": {"is_active": new_status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"is_active": new_status}

@app.delete("/api/automations/{automation_id}")
async def delete_automation(automation_id: str, request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    result = await db.automations.delete_one({"_id": ObjectId(automation_id), "user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    return {"message": "Automation deleted"}

# ============ WHATSAPP (SIMULATED) ============

@app.get("/api/whatsapp/templates")
async def get_whatsapp_templates():
    """Get available WhatsApp message templates"""
    return [
        {
            "id": "invoice_sent",
            "name": "Invoice Sent",
            "message": "Hi {client_name}! Your invoice #{invoice_number} for ₹{amount} has been generated. Please find the details attached. Thank you for your business!"
        },
        {
            "id": "payment_reminder",
            "name": "Payment Reminder",
            "message": "Hi {client_name}, this is a friendly reminder that invoice #{invoice_number} of ₹{amount} is due on {due_date}. Please let us know if you have any questions!"
        },
        {
            "id": "welcome",
            "name": "Welcome Message",
            "message": "Hi {client_name}! Welcome aboard! We're excited to work with you. Feel free to reach out if you have any questions."
        },
        {
            "id": "thank_you",
            "name": "Thank You",
            "message": "Hi {client_name}! Thank you for your payment. We appreciate your prompt response and look forward to serving you again!"
        }
    ]

@app.post("/api/whatsapp/send")
async def send_whatsapp(message: WhatsAppMessage, request: Request):
    """Simulate sending WhatsApp message"""
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    # Get contact
    contact = await db.contacts.find_one({"_id": ObjectId(message.contact_id), "user_id": user_id})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Log the message (simulated)
    msg_doc = {
        "user_id": user_id,
        "contact_id": message.contact_id,
        "contact_name": contact.get("name"),
        "contact_phone": contact.get("phone"),
        "template": message.template,
        "custom_message": message.custom_message,
        "status": "sent",  # Simulated
        "sent_at": datetime.now(timezone.utc)
    }
    
    await db.whatsapp_messages.insert_one(msg_doc)
    
    # Log activity
    await db.activities.insert_one({
        "user_id": user_id,
        "type": "whatsapp_sent",
        "message": f"WhatsApp sent to {contact.get('name')}",
        "metadata": {"contact_id": message.contact_id, "template": message.template},
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"status": "sent", "message": "WhatsApp message sent (simulated)"}

@app.get("/api/whatsapp/history")
async def get_whatsapp_history(request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    messages = await db.whatsapp_messages.find(
        {"user_id": user_id},
        {"_id": 1, "contact_name": 1, "template": 1, "status": 1, "sent_at": 1}
    ).sort("sent_at", -1).to_list(100)
    
    for m in messages:
        m["message_id"] = str(m.pop("_id"))
    
    return messages

# ============ ACTIVITY FEED ============

@app.get("/api/activities")
async def get_activities(request: Request, limit: int = 20):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    activities = await db.activities.find(
        {"user_id": user_id},
        {"_id": 1, "type": 1, "message": 1, "metadata": 1, "created_at": 1}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    for a in activities:
        a["activity_id"] = str(a.pop("_id"))
    
    return activities

# ============ DASHBOARD STATS ============

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    # Get counts
    contacts_count = await db.contacts.count_documents({"user_id": user_id})
    invoices_count = await db.invoices.count_documents({"user_id": user_id})
    automations_count = await db.automations.count_documents({"user_id": user_id})
    active_automations = await db.automations.count_documents({"user_id": user_id, "is_active": True})
    
    # Get total revenue
    pipeline = [
        {"$match": {"user_id": user_id, "status": {"$in": ["paid", "pending"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    revenue_result = await db.invoices.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Get pending invoices
    pending_invoices = await db.invoices.count_documents({"user_id": user_id, "status": "pending"})
    
    # Get leads count
    leads_count = await db.contacts.count_documents({"user_id": user_id, "status": "Lead"})
    
    return {
        "contacts": contacts_count,
        "invoices": invoices_count,
        "automations": automations_count,
        "active_automations": active_automations,
        "total_revenue": round(total_revenue, 2),
        "pending_invoices": pending_invoices,
        "leads": leads_count
    }

# ============ TEMPLATES ============

@app.get("/api/templates")
async def get_automation_templates():
    """Get pre-built automation templates"""
    return [
        {
            "id": "new_client_crm",
            "name": "New Client → CRM Entry",
            "description": "When a new row is added to Excel, create a CRM contact",
            "trigger_type": "new_row",
            "action_type": "update_crm",
            "icon": "users"
        },
        {
            "id": "sale_invoice_whatsapp",
            "name": "Sale → Invoice + WhatsApp",
            "description": "When a sale is recorded, generate invoice and notify client",
            "trigger_type": "new_row",
            "action_type": "create_invoice",
            "icon": "receipt"
        },
        {
            "id": "payment_reminder",
            "name": "Pending Payment → Reminder",
            "description": "When payment is overdue, send WhatsApp reminder",
            "trigger_type": "status_change",
            "action_type": "send_whatsapp",
            "icon": "bell"
        },
        {
            "id": "status_update",
            "name": "Status Change → CRM Update",
            "description": "When status column changes, update CRM contact status",
            "trigger_type": "status_change",
            "action_type": "update_crm",
            "icon": "refresh"
        }
    ]

# Run automation simulation
@app.post("/api/automations/{automation_id}/run")
async def run_automation(automation_id: str, request: Request):
    user = await get_current_user(request)
    user_id = user.get("user_id")
    
    automation = await db.automations.find_one({"_id": ObjectId(automation_id), "user_id": user_id})
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    # Simulate running the automation
    await db.automations.update_one(
        {"_id": ObjectId(automation_id)},
        {"$inc": {"run_count": 1}, "$set": {"last_run": datetime.now(timezone.utc)}}
    )
    
    # Log activity
    await db.activities.insert_one({
        "user_id": user_id,
        "type": "automation_run",
        "message": f"Automation '{automation['name']}' executed successfully",
        "metadata": {"automation_id": automation_id},
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"status": "success", "message": f"Automation '{automation['name']}' executed"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
