## VStream

A full‑stack movie discovery and reviewing platform. Users can browse movies, read/write reviews, like/dislike and bookmark titles, generate recommendations, and get AI‑assisted “movie expert” help. The app is a monorepo with a React + Vite client and a Go (Gin) + MongoDB server.

-  **Client**: React 19, Vite 7, Tailwind CSS 4, Radix UI, React Router 7, TanStack Query 5, Zustand, Zod
-  **Server**: Go 1.25, Gin, MongoDB Driver v2, JWT, CORS, Validator, dotenv
-  **Auth**: Cookie-based JWT access + refresh tokens
-  **Data**: MongoDB, collections for movies, reviews, users
-  **Deployment**: Frontend can be deployed to Vercel (rewrite `/api`), backend to Render (or any Go host)

---

### Repository Structure

```
client/
  VStreamClient/           # React + Vite app
    src/
      components/          # UI components
      pages/               # Route pages
      layouts/             # Layout wrappers
      service/             # API clients (axios)
      config/axiosConfig.js# axios instance & refresh flow
      routes/              # Route composition
    vite.config.js         # Vite + Tailwind + path alias
    vercel.json            # Rewrites /api → backend URL

server/
  VStreamServer/           # Go backend
    main.go                # Server bootstrap (Gin + CORS)
    routes/                # Protected & unprotected route wiring
    controllers/           # Feature controllers (auth, movie, review, user)
    database/              # Mongo connection & collection helpers
    middleware/            # Auth middleware (JWT)
    models/                # Data models
    utils/                 # JWT, constants, helpers
```

---

### Features

-  **Browse Movies**: Pagination, search, filter by genre
-  **Movie Details**: Trailer support, similar gallery, reviews list
-  **User Accounts**: Register, login, logout, profile update, change password, upload avatar
-  **Reactions**: Like/Dislike movies; view liked and bookmarked lists
-  **Bookmarks**: Toggle bookmarks and list bookmarked movies
-  **Reviews**: Add reviews; view paginated reviews per movie; popular topic words
-  **Recommendations**: Recommended feed and story‑based generation endpoint
-  **AI Expert Help**: Ask for tailored suggestions via `/movie/expert-help`
-  **Theming & UI**: Dark/light mode, Radix UI components, Tailwind utilities

---

### Tech Highlights

-  **Client**

   -  React 19 with Vite HMR
   -  Tailwind CSS 4 and Radix UI primitives
   -  React Router 7 nested routing
   -  TanStack Query for data fetching & caching
   -  Zustand for lightweight state
   -  Zod + React Hook Form for robust forms
   -  Axios with a refresh‑on‑401 interceptor
   -  Module alias `@` → `src/`

-  **Server**
   -  Gin HTTP framework with structured routing
   -  MongoDB Driver v2
   -  Cookie‑based JWT access and refresh tokens
   -  Central auth middleware for protected routes
   -  CORS configured via `ALLOWED_ORIGINS`

---

### Quick Start

Prerequisites:

-  Node 18+ (recommended) and npm
-  Go 1.25+
-  A MongoDB instance (local or cloud)

1. Clone the repo

```bash
git clone <this-repo-url>
cd vstream
```

2. Configure server environment (`server/VStreamServer/.env`)

```bash
# Required
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
DATABASE_NAME=vstream

# JWT secrets (use strong, random strings)
JWT_SECRET_KEY=your_access_token_secret
JWT_REFRESH_SECRET_KEY=your_refresh_token_secret

# Frontend origins (comma-separated) for CORS
ALLOWED_ORIGINS=http://localhost:5173
```

3. Run the backend

```bash
cd server/VStreamServer
go mod download
go run main.go
# Server listens on :8080
```

4. Run the frontend

```bash
cd client/VStreamClient
npm install
npm run dev
# Vite serves on :5173 by default
```

Local development API routing:

-  The client axios base is `"/api"` (`src/config/axiosConfig.js`).
-  For deployment, `vercel.json` rewrites `/api/*` → backend URL.
-  For local dev you have two options:
   1. Use a reverse proxy (recommended): Add a Vite dev server proxy in `vite.config.js` to forward `/api` to `http://localhost:8080`. Example:
      ```js
      // vite.config.js
      export default defineConfig({
      	server: { proxy: { "/api": "http://localhost:8080" } },
      });
      ```
   2. Alternatively, run the frontend in a production‑like environment where a reverse proxy (e.g., Nginx) forwards `/api` to the Go server.

Without a dev proxy, requests to `/api` will hit the Vite dev server and fail.

---

### Environment Variables (Server)

The server reads from `.env` (loaded via `github.com/joho/godotenv`):

-  `MONGODB_URI` (required): Full MongoDB connection string
-  `DATABASE_NAME` (required): Database name for collections
-  `JWT_SECRET_KEY` (required): HMAC secret for access token signing
-  `JWT_REFRESH_SECRET_KEY` (required): HMAC secret for refresh token signing
-  `ALLOWED_ORIGINS` (optional): Comma‑separated list of allowed origins for CORS; defaults to `http://localhost:5173`

Tokens:

-  Access token expiry: 24h
-  Refresh token expiry: 7d
-  Tokens are stored in cookies; the axios client is configured with `withCredentials: true`

---

### Client Scripts

From `client/VStreamClient`:

-  `npm run dev`: Start Vite dev server
-  `npm run build`: Production build
-  `npm run preview`: Preview built app
-  `npm run lint`: Lint

---

### Server Run

From `server/VStreamServer`:

-  `go run main.go`: Run server locally on port 8080
-  `go mod download`: Fetch dependencies

---

### API Overview

Base URL expectations:

-  Development: `http://localhost:5173/api` (proxied to `http://localhost:8080`)
-  Production: `/api` rewritten by hosting (e.g., Vercel → Render)

Unauthenticated:

-  `POST /register` — create an account
-  `POST /login` — login and set cookies
-  `POST /logout` — clear auth cookies
-  `POST /refresh` — rotate tokens via cookie
-  `GET /movies` — list movies (query: `page`, `limit`, `search`, `genre`)
-  `GET /genres` — list available genres

Authenticated (requires cookies + valid JWT):

-  Movies

   -  `GET /movie/:imdb_id` — get movie detail
   -  `POST /movie/add` — add a movie
   -  `GET /recommended_movies` — paginated recommended movies
   -  `POST /movie/user_story/wai` — generate movie from user story
   -  `PATCH /movie/:id/update` — update movie
   -  `DELETE /movie/:id/delete` — delete movie
   -  `PATCH /movies/:imdb_id/reaction?action=like|dislike` — like/dislike

-  Reviews

   -  `GET /movies/:imdb_id/reviews?page=<n>` — paginated list of reviews
   -  `GET /movies/:imdb_id/reviews/topics` — popular words/topics
   -  `POST /movies/:imdb_id/add_review` — add a review

-  Users
   -  `GET /me` — current user profile
   -  `POST /me/update` — update profile
   -  `POST /me/change_password` — change password
   -  `POST /me/upload_avatar` — upload avatar (multipart/form-data)
   -  `GET /users/:user_id/avatar` — fetch a user avatar
   -  `GET /me/bookmarked_movies` — list bookmarks
   -  `GET /me/liked_movies?page=<n>` — list liked movies
   -  `GET /me/reviews?page=<n>` — list user’s reviews
   -  `POST /bookmark/:movieId` — toggle bookmark
   -  `POST /movie/expert-help` — ask the “movie expert”

Auth & middleware:

-  Protected routes use `AuthMiddleware` which:
   -  Extracts `access_token` cookie
   -  Validates JWT and populates `userId` and `role` in context
   -  Rejects 401s for missing/invalid tokens

Client refresh flow:

-  The axios interceptor retries 401s once by calling `POST /refresh`, then repeats the original request.

---

### Development Workflow

-  Start MongoDB (local or connect to Atlas)
-  Run the Go server (`go run main.go`)
-  Run the Vite dev server (`npm run dev`) with a proxy for `/api`
-  UI/UX components live under `src/components` and `src/pages`
-  Data fetching is standardized via `src/service/*.js` using the shared axios instance
-  Global auth/user/movie state in `src/store/*` (Zustand)

---

### Deployment

Frontend (Vercel):

-  `client/VStreamClient/vercel.json` contains:
   ```json
   {
   	"rewrites": [
   		{ "source": "/api/:path*", "destination": "https://vstream-1f46.onrender.com/:path*" },
   		{ "source": "/(.*)", "destination": "/" }
   	]
   }
   ```
-  Adjust the `destination` to your backend URL.
-  Build with `npm run build` and deploy the `client/VStreamClient` project.

Backend (Render or similar):

-  Set environment variables from the server section above.
-  Expose port `8080` and ensure CORS `ALLOWED_ORIGINS` includes the deployed frontend domain.

---

### Troubleshooting

-  401 Unauthorized on protected endpoints:

   -  Ensure cookies are allowed (axios sets `withCredentials: true`)
   -  Verify `JWT_SECRET_KEY` and `JWT_REFRESH_SECRET_KEY`
   -  Confirm `POST /refresh` works and returns new cookies
   -  Check that your dev proxy forwards `/api` to the backend

-  CORS errors:

   -  Add your frontend origin to `ALLOWED_ORIGINS` (comma‑separated)
   -  Restart the server after env changes

-  MongoDB connection issues:

   -  Verify `MONGODB_URI` and `DATABASE_NAME`
   -  Ensure network access (Atlas IP allowlist, local port, etc.)

-  Frontend cannot reach `/api` in dev:
   -  Add a Vite proxy in `vite.config.js` as shown above
   -  Confirm server is running on `:8080`

---

### License

Proprietary. All rights reserved.
