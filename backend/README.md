# CiPD CMS

Self-hosted **Payload CMS** backend for the CiPD website. Drives all content on the React frontend in `../src/`:

- **Events** — create / edit / delete events, upload event photos, manage agendas & speakers
- **iPD-CP Page** — edit copy & data for each of the 8 scroll-story slides
- **Global Settings** — Apply Now URL, application deadline, navbar links, hero copy, footer

Built on Payload v3 (Next.js 15) with SQLite for zero-infrastructure persistence.

---

## First-time setup

```bash
cd backend
npm install --legacy-peer-deps          # ~1 min — Payload pins a specific Next.js range
cp .env.example .env                    # edit PAYLOAD_SECRET to a long random string
openssl rand -hex 32                    # generate a secret to paste into .env
npm run dev                             # starts on http://localhost:3001
```

Open <http://localhost:3001/admin>. The first time you visit, Payload prompts you to create the first admin user — fill it in and you're logged in.

The SQLite database is created at `backend/cms.db`. Uploaded files land in `backend/media/`. Both are gitignored.

---

## Running day to day

```bash
npm run dev                # dev server with auto-reload (port 3001)
npm run build && npm start # production build + start
npm run generate:types     # regenerate src/payload-types.ts from the schema
```

The frontend (CRA app, port 3000) and the CMS (Next.js, port 3001) run as **two separate processes**. Open two terminals:

```bash
# Terminal 1 — frontend
cd /home/sushant/cipd-scrollanimation
npm start

# Terminal 2 — backend
cd /home/sushant/cipd-scrollanimation/backend
npm run dev
```

---

## API endpoints

All endpoints are CORS-allowed from `http://localhost:3000` by default (configurable via `PAYLOAD_PUBLIC_FRONTEND_URLS` in `.env`).

| Endpoint                              | Returns                                    |
| ------------------------------------- | ------------------------------------------ |
| `GET /api/events`                     | List events (supports `where`, `sort`, `limit`, `page`) |
| `GET /api/events/:id`                 | Single event by ID                         |
| `GET /api/globals/ipdcp-page`         | Full iPD-CP page content (all 8 slides)    |
| `GET /api/globals/settings`           | Site-wide settings                         |
| `GET /api/media/:id`                  | Media file metadata                        |
| `GET /media/:filename`                | The actual file (image/video)              |
| `POST /api/users/login`               | Admin login (returns JWT)                  |

GraphQL is also available at `/api/graphql` with a playground at `/api/graphql-playground`.

Full Payload REST docs: <https://payloadcms.com/docs/rest-api/overview>

---

## Wiring the React frontend to fetch from the CMS

The React app still hard-codes its data. To switch it over, replace the static arrays with `fetch()` calls. Sketch for `src/EventsPage.jsx`:

```js
const API = "http://localhost:3001";  // move to env var for production

const [events, setEvents] = useState([]);
useEffect(() => {
  fetch(`${API}/api/events?limit=50&sort=-isoDate`)
    .then((r) => r.json())
    .then((data) => setEvents(data.docs));
}, []);
```

Same pattern for the iPD-CP page (`fetch('/api/globals/ipdcp-page')`) and settings.

For image URLs, prepend the CMS base URL: `<img src={`${API}${event.images[0].image.url}`} />`.

I have not wired this in yet — the frontend keeps its hard-coded data so nothing breaks. Wire it incrementally once you've populated the CMS with real content via the admin UI.

---

## File structure

```
backend/
├── README.md                          # this file
├── package.json
├── tsconfig.json
├── next.config.mjs
├── .env.example                       # copy to .env
├── cms.db                             # SQLite database (gitignored, created on first run)
├── media/                             # uploaded files (gitignored, created on first upload)
└── src/
    ├── payload.config.ts              # main Payload config — collections, globals, db
    ├── collections/
    │   ├── Events.ts                  # Events: type, title, agenda, speakers, photos…
    │   ├── Media.ts                   # All image/file uploads
    │   └── Users.ts                   # Admin login accounts
    ├── globals/
    │   ├── IpdcpPage.ts               # 8-slide scroll-story content
    │   └── Settings.ts                # Apply URL, deadline, hero copy, navbar, footer
    └── app/                           # Next.js App Router mount points (don't edit usually)
        ├── (frontend)/                # The root page that links to /admin
        └── (payload)/
            ├── admin/[[...segments]]/ # Mounts the Payload admin UI
            └── api/                   # Mounts REST + GraphQL endpoints
```

---

## Editing the schema

When you change a collection / global definition (e.g., add a field to `Events.ts`):

1. The dev server picks up the change and auto-reloads.
2. SQLite tables are migrated automatically — no manual SQL.
3. Run `npm run generate:types` to keep TypeScript types in sync.

For **production**, set `db: sqliteAdapter({ migrationDir: "./migrations" })` and use `npx payload migrate` for explicit, reviewable migrations (recommended once the schema stabilises).

---

## Backup & deploy

**What to back up:**
- `cms.db` — the entire database (one file)
- `media/` — uploaded files
- `.env` — secrets

Both are gitignored by design.

**Deploying:** Any Node host that supports Next.js 15 will work — Railway, Render, Fly.io, a VPS with PM2, etc. The simplest production setup is:

```bash
cd backend
npm run build
PAYLOAD_SECRET=<production-secret> DATABASE_URI=file:./cms.db npm start
```

Put it behind nginx or Caddy with HTTPS. Set `PAYLOAD_PUBLIC_FRONTEND_URLS` to the real frontend domain so CORS allows the public site.

If/when SQLite isn't enough (multi-instance, heavy concurrent writes), swap the adapter to `@payloadcms/db-postgres` — only 4 lines change in `payload.config.ts`.

---

## Known issues / next steps

- **No seed data.** The CMS starts empty. Either type the events into the admin UI manually, or write a small seed script that reads the existing hard-coded arrays from `../src/EventsPage.jsx` and POSTs them to `/api/events`. (Open question: should this be on the roadmap?)
- **Single user role.** Anyone who logs in can edit anything. Multi-role / fine-grained permissions (CMS editor vs. super admin) is a v2 feature.
- **Frontend still uses hard-coded data.** Wiring is documented above but not implemented — done deliberately so nothing breaks until the CMS is populated.
