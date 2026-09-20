# RazMed Enterprise Management Platform

A full-stack automotive retail system for RazMed Enterprise's Accra and Kumasi branches. It combines the public company website, online product catalogue, staff point of sale, inventory, customers, suppliers, purchasing, finance, expenses, approvals, workforce, payroll, reporting, and administration in one application.

## Business scope

- Tyres
- Rims
- Car batteries
- Engine oils and automotive lubricants
- Automotive services, quotations, warranties, layby and fleet accounts
- Independent inventory and reporting for Accra and Kumasi

Fuel-station and supermarket operations are intentionally excluded.

## Technology

- React 18 and Vite
- Fastify API
- MongoDB with Mongoose
- Tailwind CSS and Recharts
- Capacitor Android wrapper and installable PWA

## Local development

Requirements: Node.js 18 and npm.

```bash
npm install
npm --prefix server install
cp .env.example .env
cp server/.env.example server/.env
npm --prefix server run seed
npm --prefix server run dev
```

In a second terminal:

```bash
npm run dev
```

The website opens at `http://localhost:5173` and the API at `http://localhost:4000/api`.

## Environment variables

Frontend:

- `VITE_API_URL`: API base URL. Leave it unset in production when the frontend and API share one domain.

Backend:

- `PORT`: API port, default `4000`
- `MONGODB_URI`: production MongoDB connection string
- `JWT_SECRET`: random secret of at least 32 characters
- `CORS_ORIGIN`: comma-separated allowed web origins

Never commit `.env`, database exports, customer/staff records, transaction exports, or production backups.

## Safe demo seed

`npm --prefix server run seed` creates only two RazMed demonstration branches and an automotive sample catalogue. It contains no information copied from any other company. Demo usernames are `admin`, `ceo`, `gm`, `branch`, `finance`, and `staff`; each temporary password matches its username. Change every password before production use.

## Production

The included Railway configuration builds the Vite frontend and serves it from the Fastify service. Configure `MONGODB_URI`, `JWT_SECRET`, and `CORS_ORIGIN` in the deployment environment.

## Mobile and PWA

Run `npm run cap:android` to build and sync the Android wrapper. The same web application is installable as a PWA on supported desktop and mobile browsers.

## Privacy and repository safety

This repository is a sanitized RazMed codebase. It intentionally excludes external-company records, legacy migrations, production credentials, database dumps, transaction files, customer lists, employee lists, and backups.
