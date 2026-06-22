# CMS Agency Starter Kit

> A production-ready, single-tenant CMS for custom service-business websites. Built for agencies. No database required — all content is stored in JSON files.

---

## What Is This?

This is a **CMS starter kit** for web agencies. When you build a custom website for a client (dentist, plumber, lawyer, etc.), you can drop this CMS into their project. They get a polished admin dashboard to edit content, while you retain full control over the design and layout.

**This is NOT:**
- A SaaS platform
- A multi-tenant system
- A website builder
- A drag-and-drop editor

**This IS:**
- A developer-friendly content layer
- A client-friendly admin dashboard
- A JSON file-based CMS
- A reusable starter kit for every client project

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Storage | JSON files on disk |
| Auth | Session-based (bcrypt + express-session) |

---

## Project Structure

```
cms-agency/
├── server/            # Express API
│   └── src/
│       ├── index.js           # Entry point
│       ├── routes/            # API routes (auth, pages, collections, settings, media)
│       ├── middleware/        # Auth guard, error handler
│       ├── utils/           # File store, hash, validation
│       └── config/          # Server config
├── client/            # React Admin Dashboard
│   └── src/
│       ├── App.jsx            # Router
│       ├── context/           # AuthContext
│       ├── components/        # UI components (forms, tables, modals, pickers)
│       ├── pages/             # Dashboard views
│       └── config/            # Section & collection schemas (developer-editable)
├── content/           # LIVE DATA (JSON files + uploads)
│   ├── pages/
│   ├── collections/
│   ├── settings/
│   └── uploads/
├── website/           # Sample website (shows how to consume CMS data)
└── README.md
```

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs root deps and runs `postinstall` for both `server/` and `client/`.

### 2. Environment

```bash
cp .env.example .env
# Edit .env if needed (default port is 5000)
```

### 3. Run Development

```bash
npm run dev
```

This starts both the Express server (port 5000) and the Vite React app (port 3000) concurrently.

### 4. Login

Open http://localhost:3000/admin

- **Username:** `admin`
- **Password:** `changeme` (change this immediately after first login)

---

## Features

### Admin Dashboard

- **Dashboard** — overview stats (pages, blog posts, media, services)
- **Pages** — edit page content, manage sections, reorder sections
- **Blog** — create, edit, delete, draft/publish posts
- **Services** — manage service listings
- **Testimonials** — manage client testimonials
- **FAQs** — manage frequently asked questions
- **Team** — manage team members
- **Media Library** — upload, delete, search, copy URLs
- **SEO** — manage per-page meta tags, Open Graph, schema markup
- **Settings** — business info, global SEO, branding colors

### Section Builder

Pages are built from sections. The developer defines what sections are available in `client/src/config/sections.js`. Clients can:

- Add sections (Hero, About, Services, Testimonials, FAQ, Gallery, Team, CTA, Contact)
- Delete sections
- Duplicate sections
- Reorder sections (up/down)
- Edit section fields via dynamic forms

### Field Types

The CMS supports: `text`, `textarea`, `number`, `boolean`, `image`, `select`, `relation`, `color`, `url`, `date`

### Live Preview

When editing a page, click "Preview" to see changes in the actual website before saving. The CMS passes the current page state to the website via a base64-encoded query parameter.

---

## Developer Workflow

### Customizing for a New Client

1. **Clone this repo** into the client's project directory
2. **Customize `client/src/config/sections.js`** — define the sections the client needs
3. **Customize `client/src/config/collections.js`** — define the collections the client needs
4. **Customize `client/src/config/navigation.js`** — hide sidebar items the client doesn't need
5. **Build the website** — create a frontend that reads from `/content/pages/*.json` (see `website/index.html` for a working example)
6. **Seed content** — edit the JSON files in `content/` to match the client's data
7. **Deploy** — build and serve

### Adding a New Section Type

1. Add an entry to `client/src/config/sections.js`:

```js
export const sectionRegistry = {
  myCustomSection: {
    label: "My Custom Section",
    icon: "Star",
    fields: [
      { name: "heading", type: "text", label: "Heading", required: true },
      { name: "image", type: "image", label: "Image" },
    ],
  },
  // ...
};
```

2. In your website frontend, map `myCustomSection` to a React component (or HTML template) that renders the fields.

### Adding a New Collection

1. Add an entry to `client/src/config/collections.js`
2. Create a new JSON file in `content/collections/<name>.json`
3. Add a sidebar link in `client/src/config/navigation.js`

---

## Build & Deploy

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

The `npm run build` command:
1. Builds the React client into `client/dist/`
2. Copies `client/dist/` to `server/public/`
3. The Express server serves the built SPA from `server/public/`

### Deployment Targets

- **VPS / Dedicated Server:** Run `npm run build && npm start` behind Nginx or Caddy
- **Node.js Hosting (Render, Railway, Fly.io):** Works out of the box. Ensure `content/` is on a persistent volume.
- **Static Website (Netlify/Vercel):** The CMS itself is a dynamic Node.js app. The client's public website can be deployed separately as a static site that reads from the JSON files.

---

## Security

- Passwords hashed with bcrypt
- Session-based auth with httpOnly cookies
- Path traversal protection on all file operations
- Atomic JSON writes (temp file + rename)
- Rate limiting on login endpoint
- Image upload filtering (JPEG, PNG, WebP, SVG, GIF only, max 5MB)
- Safe delete for media (blocks deletion if file is referenced in content)

---

## License

MIT
