# Syntra - Product Requirements Document

## Overview
Syntra is a lightweight automation platform for Indian small businesses that connects Excel, CRM, GST invoicing, and WhatsApp. The core philosophy: Excel is the source of truth, automation should feel invisible, UI must feel calm, premium, and magical.

## Target Users
- Small business owners (1-5 people)
- Freelancers and agencies
- People who use Excel for everything, manually create invoices, track leads casually, communicate via WhatsApp

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Framer Motion, Phosphor Icons
- **Backend**: FastAPI (Python), Motor (async MongoDB)
- **Database**: MongoDB
- **PDF Generation**: ReportLab

## Design System (Updated 2026-04-03)
- **Primary Color**: #6366F1 (Indigo) → #8B5CF6 (Violet) gradient
- **Typography**: Manrope (400-800 weights) - ONLY font
- **Design**: Premium Glassmorphism
  - Glass cards: rgba(255,255,255,0.6) light / rgba(255,255,255,0.03) dark
  - Backdrop blur: 16-24px
  - Soft borders: rgba(255,255,255,0.15-0.2)
  - Gradient backgrounds with subtle noise texture
- **Dark/Light mode**: Full support with system detection + manual toggle

## What's Been Implemented

### Phase 1: MVP (2026-04-03)
- Full authentication system (email/password + Google OAuth)
- Dashboard with stats and activity feed
- Excel file upload and parsing
- Contact/CRM management
- GST invoice creation with PDF export
- Automation builder with templates
- Simulated WhatsApp messaging
- Dark/light mode toggle
- Responsive design

### Phase 2: Premium UI Refactor (2026-04-03)
- Glassmorphism design system
- Gradient mesh backgrounds
- Premium typography (Manrope only)
- Glass cards with backdrop blur
- Smooth micro-interactions
- Hover effects on all interactive elements
- Improved dark mode with proper contrast
- Loading shimmer states
- Enhanced visual hierarchy

## Backlog

### P0 (Critical)
- None - MVP complete with premium UI

### P1 (High Priority)
- Google Sheets API integration (real-time sync)
- Real WhatsApp API integration (Twilio)
- Email invoice to client
- Payment link integration (Razorpay)

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

## Test Credentials
- **Admin**: admin@syntra.app / SyntraAdmin123!

## Next Tasks
1. Add real-time webhook for Excel data sync
2. Implement business profile settings
3. Add invoice email functionality
4. Consider Google Sheets API for direct sync
5. Integrate Razorpay payment links
