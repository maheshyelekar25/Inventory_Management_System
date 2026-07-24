# Inventory Management System

## Implementation Guide

### Tech Stack

-   Frontend: React + Vite + Tailwind CSS
-   Backend: FastAPI + SQLAlchemy + Alembic
-   Database: Supabase PostgreSQL
-   Auth: JWT + bcrypt
-   Deployment: Vercel + Render + Supabase

## Development Rules

-   Modular architecture
-   REST APIs
-   Environment variables only
-   No secrets committed
-   Type hints and validation
-   Reusable React components

## Git Workflow

    main
    └── develop
        ├── feature/backend
        ├── feature/frontend
        └── feature/integration

## Backend Modules

-   Auth
-   Users
-   Categories
-   Products
-   Dashboard
-   Stock

## Frontend Modules

-   Authentication
-   Dashboard
-   Products
-   Categories
-   Common Components
-   Context
-   Services

## API Flow

Validation → Authentication → Service Layer → Database → JSON Response

## Security

-   bcrypt password hashing
-   JWT
-   CORS
-   Input validation

## Final Checklist

-   Authentication
-   Dashboard
-   Category CRUD
-   Product CRUD
-   Search & Filter
-   Stock Update
-   Responsive UI
-   README
-   Deployment
