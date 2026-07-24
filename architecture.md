# System Architecture

## High Level

    React (Vite)
          │
       Axios REST
          │
     FastAPI Backend
          │
     SQLAlchemy ORM
          │
    Supabase PostgreSQL

## Modules

### Frontend

-   Login
-   Register
-   Dashboard
-   Products
-   Categories

### Backend

-   Auth
-   Users
-   Categories
-   Products
-   Dashboard
-   Stock

## Authentication Flow

Register → Hash Password → Login → JWT → Protected APIs

## Product Flow

React Form → API → Service → Database → Response

## Deployment

-   Frontend: Vercel
-   Backend: Render
-   Database: Supabase
