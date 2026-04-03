# Syntra Test Credentials

## Admin Account
- **Email**: admin@syntra.app
- **Password**: SyntraAdmin123!
- **Role**: admin

## Auth Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/auth/refresh
- POST /api/auth/session (Google OAuth)

## Google OAuth
- Uses Emergent Auth for Google login
- Redirect URL: dynamically generated from `window.location.origin + '/dashboard'`
- No hardcoded redirect URLs

## Test Data Created by Testing Agent
- Test Contact: "Test Contact" (Lead status)
- Test Invoice: INV-2026-0001 for "Test Client" (₹2,360)
- Test Automation: "Test Automation"
- Test Excel: test_data.csv with 2 rows
