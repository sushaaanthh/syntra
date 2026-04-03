# Syntra - Product Requirements Document

## Overview
Syntra is a lightweight automation platform for Indian small businesses that connects Excel, CRM, GST invoicing, and WhatsApp. The core philosophy: Excel is the source of truth, automation should feel invisible, UI must feel calm, premium, and magical.

## Target Users
- Small business owners (1-5 people)
- Freelancers and agencies
- People who use Excel for everything, manually create invoices, track leads casually, communicate via WhatsApp

## User Personas
1. **Small Business Owner** - Needs quick invoicing and client communication
2. **Freelancer** - Manages multiple clients, needs simple CRM
3. **Agency** - Handles multiple projects, needs automation

## Core Requirements

### Authentication
- [x] Email/password registration and login
- [x] Google OAuth via Emergent Auth
- [x] JWT-based sessions with refresh tokens
- [x] Admin user seeding

### Excel Sync Engine
- [x] Upload Excel (.xlsx, .xls) and CSV files
- [x] Parse and display data
- [x] File management (view, delete)

### Mini CRM
- [x] Contact management (name, email, phone, company)
- [x] Status tracking (Lead, Pending, Closed)
- [x] Notes field
- [x] Search functionality

### GST Invoice Generator
- [x] Client details with GSTIN
- [x] Multiple line items
- [x] Auto tax calculation (CGST/SGST for intra-state, IGST for inter-state)
- [x] Unique invoice numbers
- [x] PDF generation and download
- [x] Status tracking (pending, paid)

### Automations
- [x] "When this happens → Do this" builder
- [x] Trigger types: new_row, row_updated, status_change
- [x] Action types: create_invoice, update_crm, send_whatsapp
- [x] Active/pause toggle
- [x] Run count tracking
- [x] Pre-built templates

### WhatsApp (MOCKED)
- [x] Message templates (Invoice sent, Payment reminder, Welcome, Thank you)
- [x] Contact selection
- [x] Message history
- Note: WhatsApp sending is simulated (no real Twilio/WhatsApp API)

### Dashboard
- [x] Stats cards (Contacts, Invoices, Automations, Revenue)
- [x] Quick actions
- [x] Activity feed
- [x] Needs attention section

### Settings
- [x] Profile view
- [x] Dark/light mode toggle
- [x] Business information placeholders

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Framer Motion, Phosphor Icons
- **Backend**: FastAPI (Python), Motor (async MongoDB)
- **Database**: MongoDB
- **PDF Generation**: ReportLab

## Design System
- **Primary Color**: #6366F1 (Indigo)
- **Secondary Color**: #22C55E (Green)
- **Typography**: Manrope (headings), IBM Plex Sans (body)
- **Dark/Light mode**: Full support with system detection

## What's Been Implemented (2026-04-03)
- Full authentication system (email/password + Google OAuth)
- Dashboard with stats and activity feed
- Excel file upload and parsing
- Contact/CRM management
- GST invoice creation with PDF export
- Automation builder with templates
- Simulated WhatsApp messaging
- Dark/light mode toggle
- Responsive design

## Backlog

### P0 (Critical)
- None - MVP complete

### P1 (High Priority)
- Google Sheets API integration (real-time sync)
- Real WhatsApp API integration (Twilio)
- Email invoice to client

### P2 (Medium Priority)
- Business profile settings (GSTIN, address on invoices)
- Recurring invoices
- Payment tracking
- Export data (contacts, invoices)

### P3 (Nice to Have)
- Multi-user team support
- Invoice templates customization
- Analytics dashboard
- Mobile app

## Next Tasks
1. Add real-time webhook for Excel data sync
2. Implement business profile settings
3. Add invoice email functionality
4. Consider Google Sheets API for direct sync
