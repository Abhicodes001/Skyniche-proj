#  Login Page UI — React + Vite

A full-stack **User Authentication Portal** built with **React (Vite)** on the frontend and **Node.js/Express** on the backend, featuring JWT-based authentication, protected routes, admin access, and MySQL/MariaDB integration.

## Features

* 🔐 **User Authentication** — Login and registration with JWT
* 🛡️ **Admin Portal** — Role-based access with protected routes
* 📊 **User Dashboard** — Profile and account management
* 💾 **Database Integration** — MySQL / MariaDB
* 🔒 **Secure Passwords** — Password hashing using bcrypt
* 💡 **Remember Me** — Session persistence using localStorage
* 🎨 **Modern UI** — Responsive glassmorphism-based design
* 📱 **Responsive Design** — Works across desktop and mobile screens

##  Tech Stack

| Layer             | Technology          |
| ----------------- | ------------------- |
| Frontend          | React 18, Vite, CSS |
| Backend           | Node.js, Express    |
| Database          | MySQL / MariaDB     |
| Authentication    | JWT                 |
| Password Security | bcrypt              |

##  Project Structure

```text
login-ui/
│
├── src/
│   ├── pages/
│   │   ├── Login
│   │   ├── Dashboard
│   │   ├── UserAuth
│   │   └── AdminAuth
│   │
│   ├── components/
│   │   └── Modal
│   │
│   └── styles/
│       └── Page-specific CSS files
│
└── vrinda-user-login-backend/
    ├── routes/
    ├── controllers/
    └── config/
```

##  Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd login-ui
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Start the Frontend

```bash
npm run dev
```

The frontend will be available at the Vite development URL shown in your terminal.

### 4. Start the Backend

Open a separate terminal:

```bash
cd vrinda-user-login-backend
npm install
node server.js
```

## 🔑 Authentication Flow

```text
User
  ↓
Login / Register
  ↓
Express API
  ↓
MySQL / MariaDB
  ↓
JWT Token
  ↓
Protected Dashboard
```

## 🛡️ Security

The application uses:

* **JWT** for authentication and protected API access
* **bcrypt** for secure password hashing
* **Role-based authorization** for admin routes
* **Protected frontend routes** for authenticated users

> ⚠️ For production deployment, store secrets such as JWT keys and database credentials in environment variables rather than directly in the source code.

## 📸 Screenshots

Add screenshots of your application here:

```text
screenshots/
├── login.png
├── register.png
├── dashboard.png
└── admin.png
```

## 🔮 Future Improvements

* [ ] Email verification
* [ ] Forgot/reset password
* [ ] Refresh token authentication
* [ ] User management dashboard for admins
* [ ] Password strength validation
* [ ] Deployment with production environment variables
* [ ] Automated testing

## 👨‍💻 Author

**Abhishek**

---

⭐ If you found this project useful, consider giving the repository a star!

**Last updated:** August 2026
