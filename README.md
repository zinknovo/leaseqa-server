## LeaseQA Server

Sibling Express server that mirrors the LeaseQA docs and reuses the lightweight DAO + route pattern from the Kambaz server.

### Available Features

- Session-based auth with register/login/logout and role-based access control (tenant, lawyer, admin).
- REST resources for posts, answers, threaded discussions, folders, AI review jobs, statistics, and moderation flows.
- In-memory database seeded with rubric-friendly sample data, ideal for local development demos.
- AI review endpoint that accepts contract text or a PDF upload and runs a deterministic analyzer aligned with the requirements doc.

### Getting Started

```bash
cd leaseqa-server
cp .env.example .env
npm install
npm run dev
```

Server defaults to `http://localhost:4050` and expects the Next.js client at `http://localhost:3000` (override via `CLIENT_URL`).
