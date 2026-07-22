# Login Page UI — React + Vite

A full-stack **User Authentication Portal** built with React (Vite) on the frontend and Node.js/Express on the backend.

## Features

- 🔐 User Login & Registration with JWT authentication
- 🛡️ Admin Portal with protected routes
- 📊 Dashboard with user profile management
- 💾 MySQL/MariaDB database integration
- 🎨 Modern responsive UI with CSS glassmorphism design
- 🔒 Remember Me session persistence via localStorage

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, CSS |
| Backend | Node.js, Express |
| Database | MySQL / MariaDB |
| Auth | JWT (JSON Web Tokens), bcrypt |

## Getting Started

```bash
# Install frontend dependencies
npm install

# Start the dev server
npm run dev

# In a separate terminal, start the backend
cd vrinda-user-login-backend
npm install
node server.js
```

## Project Structure

```
login-ui/
├── src/
│   ├── pages/         # Login, Dashboard, UserAuth, AdminAuth
│   ├── components/    # Reusable Modal component
│   └── styles/        # Page-specific CSS files
└── vrinda-user-login-backend/
    ├── routes/        # API routes
    ├── controllers/   # Auth logic
    └── config/        # DB connection
```

---
Last updated: 2026-07-22
