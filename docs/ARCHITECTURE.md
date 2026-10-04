# Tapza Care — Architecture & Technical Design

## High Level System Architecture

```mermaid
graph TD
    subgraph Clients
        MobileApp["📱 Patient Mobile App (React Native / Expo)"]
        WebApp["💻 Responsive Patient Web App (React / Vite)"]
        AdminPortal["🛡️ Admin Management Portal (React / Vite)"]
    end

    subgraph Backend Services
        API["⚡ Node.js / Express REST API"]
        AuthMiddleware["🔐 JWT & Role Authorization"]
        ConfigEngine["🎨 Dynamic Home Layout Engine"]
        BookingEngine["📅 Appointment & Slot Lock Manager"]
    end

    subgraph Data Layer
        TursoCloud["☁️ Turso DB / libSQL Cloud Database"]
        LocalDB["💾 Local SQLite Fallback"]
    end

    MobileApp -->|HTTP / JSON| API
    WebApp -->|HTTP / JSON| API
    AdminPortal -->|HTTP / JSON| API

    API --> AuthMiddleware
    API --> ConfigEngine
    API --> BookingEngine

    BookingEngine -->|@libsql/client| TursoCloud
    BookingEngine -.->|Fallback| LocalDB
```

## System Components

1. **Client Applications (`apps/web`, `apps/mobile`)**:
   - Web application built with React, Vite, Tailwind CSS, and Framer Motion.
   - Mobile application built with React Native & Expo.
   - Dynamic home screen rendering based on server configuration.

2. **Backend Engine (`apps/api`)**:
   - Express server powered by TypeScript and Zod validation.
   - JWT authentication for secure sessions across web and mobile.

3. **Database Layer (`database/`)**:
   - Powered by Turso (libSQL) Cloud database: `libsql://tpza-virinchi23-tech.aws-ap-south-1.turso.io`.
