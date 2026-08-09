# ⚙️ StudySnap API Server (Backend)

Express TypeScript REST API Service cho StudySnap.

## Tech Stack
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **ORM / Database:** Prisma ORM
- **Dev Server:** `ts-node-dev`

## Cấu trúc thư mục (`src/`)
- `config/` — Environment variables & server settings
- `controllers/` — Request handlers & responses
- `middleware/` — Request validation & central error handler
- `routes/` — Express route declarations (`/api/users`)
- `services/` — Business logic implementation
- `types/` — Data Transfer Objects (DTOs) & interfaces
- `prisma/` — Database schema definition (`schema.prisma`)

## Hướng dẫn chạy

```bash
# Cài đặt dependencies
npm install

# Chạy Development Server với hot reload
npm run dev

# Build production TypeScript output
npm run build

# Start production server
npm start
```
