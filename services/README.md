<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend API

A backend has been added in `backend/` (Express + JWT + JSON file persistence).

### Start backend

1. Install backend dependencies:
   `cd backend && npm install`
2. Copy env file:
   `copy .env.example .env` (Windows) or `cp .env.example .env` (macOS/Linux)
3. Run backend:
   `npm run dev`

Backend default URL: `http://localhost:4000`

### Main endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/plans`
- `GET /api/system-config`
- `GET /api/me` (Bearer token)
- `GET /api/transactions` (Bearer token)
- `POST /api/transactions` (Bearer token)
- `GET /api/admin/overview` (Admin token)
- `GET /api/admin/users` (Admin token)
- `PATCH /api/admin/users/:id` (Admin token)
- `GET /api/admin/transactions` (Admin token)
- `PATCH /api/admin/transactions/:id` (Admin token)
- `PATCH /api/admin/system-config` (Admin token)

### Password reset emails

Configure SMTP in `backend/.env`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `APP_URL` (frontend URL used in reset links)

If SMTP is not configured, the backend logs reset links to the server console for development.
