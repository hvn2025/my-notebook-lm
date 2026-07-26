# My Notebook LM

A full-stack, NotebookLM-inspired research workspace. Users can authenticate,
create notebooks, add PDF or web sources, and ask source-grounded questions.
Documents are processed asynchronously, embedded with OpenRouter models, and
stored in Supabase PostgreSQL with pgvector.

## Features

- Email/password authentication with Supabase Auth
- User-owned notebooks with rename and delete actions
- PDF uploads stored in Supabase Storage
- Web URL ingestion
- Asynchronous ingestion with BullMQ and Upstash Redis
- LangChain document loading and recursive text chunking
- OpenRouter chat and 1536-dimensional embedding models
- pgvector cosine-similarity retrieval with an HNSW index
- Step-back prompting and dual retrieval
- Source selection and status polling with TanStack Query
- Server-Sent Events (SSE) for streamed chat responses
- Automatic notebook titles after the first source is processed
- Responsive Next.js interface built with shadcn/ui and Tailwind CSS

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui |
| Client data | TanStack Query |
| API | Express.js and TypeScript |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL, Prisma ORM, pgvector |
| File storage | Supabase Storage |
| Queue | BullMQ and Upstash Redis |
| RAG | LangChain.js and OpenRouter |
| Production UI | Vercel |
| Production API | Render |

## Architecture

```mermaid
flowchart LR
    UI[Next.js frontend] -->|Supabase JWT| API[Express API]
    API --> DB[(Supabase PostgreSQL)]
    API --> STORAGE[(Supabase Storage)]
    API --> QUEUE[(Upstash Redis)]
    QUEUE --> WORKER[BullMQ ingestion worker]
    WORKER --> STORAGE
    WORKER --> LLM[OpenRouter]
    WORKER --> DB
    API -->|Step-back + embeddings| LLM
    API -->|pgvector search| DB
    API -->|SSE tokens| UI
```

### Ingestion flow

1. The authenticated frontend uploads a PDF or submits a URL.
2. Express validates notebook ownership and creates a `PENDING` source.
3. PDFs are persisted in Supabase Storage.
4. Express adds an ingestion job to Upstash Redis and returns HTTP `202`.
5. The BullMQ worker changes the source to `PROCESSING`.
6. LangChain loads, chunks, and embeds the document.
7. The worker inserts chunks and vectors into PostgreSQL using raw SQL.
8. The source becomes `COMPLETED`, and an untitled notebook receives an
   AI-generated title.

### Chat flow

1. The user submits a question and selected source IDs.
2. The backend generates a broader step-back question.
3. Both questions are embedded concurrently.
4. Raw pgvector searches retrieve notebook-owned chunks for both questions.
5. Results are merged and deduplicated.
6. The answer is generated strictly from the retrieved context and streamed to
   the browser using SSE.

## Repository structure

```text
my-notebook-lm-1/
├── frontend/
│   ├── src/app/                 # App Router pages and auth callback
│   ├── src/components/          # Auth, notebook, workspace, and UI components
│   ├── src/hooks/               # TanStack Query hooks
│   └── src/lib/                 # API and Supabase clients
└── backend/
    ├── prisma/                  # Schema and SQL migrations
    └── src/
        ├── config/              # Environment, Prisma, upload configuration
        ├── controllers/         # HTTP request handlers
        ├── lib/queue/           # Redis, BullMQ queue, and job types
        ├── middleware/          # Authentication and error middleware
        ├── routes/              # Express route definitions
        ├── services/            # Notebook, source, chat, and RAG logic
        ├── services/ingestion/  # Loading, chunking, embedding, and persistence
        └── workers/             # BullMQ ingestion worker
```

## Prerequisites

- Node.js 22 or newer
- npm
- A Supabase project with Auth, PostgreSQL, Storage, and pgvector
- An Upstash Redis database
- An OpenRouter API key with access to chat and embedding models

## Local setup

### 1. Install the backend

```bash
cd backend
npm install
cp .env.example .env
```

Configure `backend/.env`:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:3000

DATABASE_URL=postgresql://...
DIRECT_DATABASE_URL=postgresql://...

SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SOURCE_STORAGE_BUCKET=notebook-sources

REDIS_URL=rediss://default:PASSWORD@HOST:PORT

OPENROUTER_API_KEY=...
OPENROUTER_CHAT_MODEL=openai/gpt-4o-mini
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
RAG_DEBUG=false
```

Apply the committed migrations and generate Prisma Client:

```bash
npx prisma migrate deploy
npm run prisma:generate
```

Use `prisma migrate dev` only when creating migrations against a development
database. Never run `prisma migrate reset` against a shared Supabase project.

### 2. Install the frontend

```bash
cd ../frontend
npm install
cp .env.example .env.local
```

Configure `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Never expose the Supabase secret key, database URLs, Redis credentials, or
OpenRouter key through a `NEXT_PUBLIC_` variable.

### 3. Start the application

Run each command in a separate terminal.

```bash
# Terminal 1: Express API
cd backend
npm run dev
```

```bash
# Terminal 2: ingestion worker
cd backend
npm run worker:dev
```

```bash
# Terminal 3: Next.js frontend
cd frontend
npm run dev
```

Open `http://localhost:3000`. The API health endpoint is available at
`http://localhost:4000/health`.

## API routes

All application routes except health and username availability require a valid
Supabase bearer token.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API liveness check |
| `GET` | `/api/users/username-available` | Check username availability |
| `GET` | `/api/users/me` | Read the authenticated profile |
| `POST` | `/api/users/me` | Synchronize the Supabase user profile |
| `GET` | `/api/notebooks` | List the current user's notebooks |
| `POST` | `/api/notebooks` | Create an untitled notebook |
| `GET` | `/api/notebooks/:id` | Read an owned notebook |
| `PATCH` | `/api/notebooks/:id` | Rename an owned notebook |
| `DELETE` | `/api/notebooks/:id` | Delete a notebook and its sources |
| `GET` | `/api/sources?notebookId=...` | List notebook sources |
| `POST` | `/api/sources/upload` | Upload a PDF using multipart form data |
| `POST` | `/api/sources/url` | Register and enqueue a web URL |
| `GET` | `/api/sources/:id/status` | Poll ingestion status |
| `DELETE` | `/api/sources/:id` | Delete a source, chunks, and stored PDF |
| `POST` | `/api/chat` | Stream a notebook-grounded answer with SSE |
| `POST` | `/test-chat` | Run the authenticated in-memory RAG test |

## Database model

```text
Supabase Auth user
        │ 1:1 through User.authUserId
        ▼
User 1 ─── * Notebook 1 ─── * Source 1 ─── * DocumentChunk
```

Deleting a user-owned notebook cascades through its sources and chunks. Stored
PDF objects are also removed by the backend service. `DocumentChunk.embedding`
uses PostgreSQL `vector(1536)` and a custom HNSW cosine-distance index migration.

## Production deployment

### Backend on a free Render Web Service

The current prototype can run Express and BullMQ together in one web service.

```text
Root Directory: backend
Build Command: npm ci --include=dev && npm run prisma:generate && npm run build
Start Command: npm run start:all
Health Check Path: /health
Node Version: 22 or newer
```

Set `CLIENT_ORIGIN` to the exact Vercel production origin without a trailing
slash. Do not set `PORT`; Render supplies it.

The combined free service is intended for demonstrations. Render can suspend it
after inactivity, interrupting background work. A production deployment should
run `npm run worker:start` in a persistent worker service or replace BullMQ with
a serverless queue such as QStash.

### Frontend on Vercel

```text
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: default
Node Version: 22.x
```

Production variables:

```env
NEXT_PUBLIC_API_URL=https://YOUR_BACKEND.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

After deployment, configure Supabase Auth:

```text
Site URL: https://YOUR_FRONTEND.vercel.app
Redirect URL: https://YOUR_FRONTEND.vercel.app/auth/callback
```

Environment-variable changes require a new deployment.

## Troubleshooting

### `Failed to fetch`

- Open `https://YOUR_BACKEND.onrender.com/health` to wake and verify Render.
- Confirm `NEXT_PUBLIC_API_URL` contains the Render URL without quotes or a
  trailing slash, then redeploy Vercel.
- Confirm `CLIENT_ORIGIN` exactly matches the URL in the browser, then restart
  Render.
- A Vercel preview URL will fail if only the production origin is allowed.

### Source remains `PENDING`

- Confirm the worker is running and its logs say it is listening on the
  ingestion queue.
- Confirm the API and worker use the same `REDIS_URL`.
- Check that Supabase Storage and OpenRouter variables are present.

### Source becomes `FAILED`

- Inspect worker logs for loader or embedding errors.
- Confirm the selected OpenRouter embedding model returns 1536 dimensions.
- Some websites block automated extraction with authentication, CAPTCHA, or
  anti-bot protection; use a PDF or an accessible URL instead.

### Prisma deployment errors

Use the production migration commands:

```bash
cd backend
npx prisma migrate status
npx prisma migrate deploy
```

Do not reset the Supabase production schema.
