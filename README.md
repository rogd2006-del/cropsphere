# 🌾 CropSphere (FarmDirect Cloud)

> **Cloud-Based Smart Marketplace Connecting Local Farmers Directly with Consumers**  
> Transparent pricing in Indian Rupees (₹), farm-to-table traceability, real-time logistics, and multi-cloud architectural resilience.

---

## 🌟 Highlights & Features

- **Direct Farmer-to-Consumer Marketplace**: Bypass middlemen with transparent pricing in Indian Rupees (**₹**), fresh seasonal highlights, and organic certifications.
- **Interactive Geo-Spatial Farm Map**: Leaflet-powered visual farm locator pinpointing verified local growers, top harvest yields, and direct coordinates.
- **Role-Based Portals & Dashboards**:
  - 🧑‍🌾 **Farmer Dashboard**: Real-time inventory management, produce listing creation, price adjustments in ₹, low-stock alerts, and order state transitions (*Pending → Confirmed → Dispatched → Delivered*).
  - 🛒 **Consumer Portal**: Cart drawer with auto tax/delivery calculations, live order timeline tracking, and safe simulated checkout.
  - 🛡️ **Admin Telemetry & Oversight**: Platform statistics, gross revenue tracking, user role toggling, and audit telemetry logs.
  - ☁️ **Cloud Diagnostics Dashboard**: Live telemetry monitoring DBaaS (MongoDB Atlas), object storage providers (Azure Blob / AWS S3 / local), API endpoints, and uptime metrics.
- **🤖 Built-in Gemini AI Assistant**: Context-aware assistant providing culinary storage tips, seasonal recipe ideas, and agricultural guidance.
- **🔐 Flexible Authentication**:
  - **Account-Based Sign-In**: Register as a consumer or farmer and sign in with your own credentials.
  - **Clerk OAuth & JWT**: Secure email and social sign-in integration.
- **🎨 Curated Design Palette**: Built with modern typography, smooth crossfading carousels, and a cohesive palette:
  - **Pantone Raspberry Pink** (`#E3266F`): Primary interactive accent
  - **Amazon Forest Green** (`#061c12`): Structural grounding & typography
  - **Cannoli Cream** (`#f0efe2`): Soft organic background

---

## 🏗️ Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │          React 19 + Vite Client        │
                      │   (Leaflet Map, Clerk, Lucide Icons)   │
                      └──────────────────┬─────────────────────┘
                                         │ REST API / JWT
                                         ▼
                      ┌────────────────────────────────────────┐
                      │       Express + TypeScript Server       │
                      │  (Rate Limiting, Helmet, Winston Logs) │
                      └───────┬──────────────┬──────────────┬──┘
                              │              │              │
                              ▼              ▼              ▼
                    ┌──────────────────┐ ┌────────┐ ┌────────────────┐
                    │  MongoDB Atlas   │ │ Gemini │ │ Cloud Storage  │
                    │     (DBaaS)      │ │ AI API │ │ (Local/S3/Blob)│
                    └──────────────────┘ └────────┘ └────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Leaflet, `@clerk/clerk-react`, Lucide React |
| **Backend** | Node.js, Express, TypeScript, `tsx`, Mongoose, Argon2, Winston, Swagger UI |
| **Database** | MongoDB Atlas (DBaaS) / Local MongoDB |
| **AI Integration** | Google Gemini API (AI Assistant Widget) |
| **Styling** | Vanilla CSS Design System with curated HSL color tokens |

---

## 📁 Project Structure

```bash
cropsphere/
├── client/                      # React + Vite Frontend
│   ├── public/                  # Static assets & icons
│   └── src/
│       ├── components/          # Reusable UI (Navbar, FarmMap, CartDrawer, etc.)
│       ├── context/             # AuthContext, CartContext
│       ├── pages/               # HomePage, Marketplace, Farmer/Consumer/Admin Dashboards
│       └── services/            # Client API client & endpoints
├── server/                      # Node.js + Express + TypeScript Backend
│   └── src/
│       ├── config/              # Database connection & cloud config
│       ├── middleware/          # JWT auth, role validation, rate-limiter
│       ├── models/              # Mongoose schemas (User, Product, Order, AuditLog)
│       ├── routes/              # Express API route controllers
│       ├── scripts/             # Database seeding scripts
│       └── services/            # Payment gateway, Gemini AI proxy, storage providers
├── .env.example                 # Environment variables template
├── package.json                 # Root workspace orchestrator
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas** cluster URI (or local MongoDB running on `mongodb://localhost:27017`)

---

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rogd2006-del/cropsphere.git
   cd cropsphere
   ```

2. **Install dependencies** across all workspaces:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
   Fill in your configuration details:
   ```ini
   # Server
   PORT=5000
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=your_jwt_secret_key_here

   # MongoDB Atlas Connection
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/cropsphere?retryWrites=true&w=majority

   # Clerk Authentication (Optional for OAuth)
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Google Gemini AI (Optional for AI Assistant)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Razorpay test credentials (required for checkout)
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
   ```

   Obtain test API keys from the Razorpay Dashboard. Keep the key secret only in the server-side root `.env`; never add it to client environment files or commit it. The checkout uses Razorpay test mode with no live charges when configured with an `rzp_test_` key.

4. **Seed Demo Data** *(Optional)*:
   Populate the database with sample farmers, verified produce, and initial orders:
   ```bash
   npm run seed
   ```

5. **Start Development Server**:
   Launches both the Express API server (`:5000`) and the Vite client (`:5173`) concurrently:
   ```bash
   npm run dev
   ```

6. **Open in Browser**:
   Navigate to [http://localhost:5173](http://localhost:5173).

---

## ☁️ Deploy to Render and Vercel

Deploy both the Express API and React/Vite frontend as services in one **Vercel** project, or deploy the API to **Render** and the frontend to Vercel separately. MongoDB Atlas remains the database. The Render Blueprint is in [`render.yaml`](./render.yaml), and the Vercel multi-service routing is configured in [`vercel.json`](./vercel.json).

### 1. Prepare MongoDB Atlas

- Create a production database and a dedicated database user.
- For a Render free web service, its outbound IP addresses are not fixed. For a quick deployment, Atlas may require allowing access from anywhere (`0.0.0.0/0`); restrict access to fixed IPs or use private networking for production where available.
- Copy the Atlas connection string. Keep it private.

### 2. Deploy the API to Render

1. Push the repository to GitHub.
2. In Render, choose **New → Blueprint**, connect the repository, and deploy using `render.yaml` at the repository root.
3. Add the values for the Blueprint's `CLIENT_URL`, `MONGODB_URI`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` environment variables in the Render dashboard. Use Razorpay **test** keys first. The Blueprint generates `JWT_SECRET` and `COOKIE_SECRET`.
4. Wait for the service to become healthy. Its API URL will look like `https://cropsphere-api.onrender.com`; verify `https://<render-service>.onrender.com/api/health`.

The Blueprint builds with `npm ci && npm run build --workspace=@farmdirect/server` and starts with `npm run start --workspace=@farmdirect/server`. Render supplies the port automatically. Its free plan may spin down when idle, so the first request after inactivity can be slow.

### 3. Deploy with Vercel services

1. In Vercel, import the repository and keep the project's **Root Directory** at the repository root (`.`), not `client`. The root [`vercel.json`](./vercel.json) defines the `client` Vite service and the `server` Express service. Each service installs from its own `package.json` to avoid Vercel running `npm install --prefix=..` for a service subdirectory.
2. Vercel routes `/api/*` to the Express service and all other paths to the client service. The client already uses relative `/api` requests, so it needs no `VITE_API_BASE_URL` override; remove any old `VITE_API_BASE_URL` setting from this Vercel project.
3. Configure the API's production environment variables in Vercel, including `CLIENT_URL` (the deployed Vercel origin), `MONGODB_URI`, `JWT_SECRET`, `COOKIE_SECRET`, and the Razorpay test credentials. Keep secrets out of the client build and never use `VITE_` variables for secrets.
4. Deploy and verify `https://<your-vercel-domain>/api/health`, then test sign-in, product browsing, and Razorpay test checkout.

The client calls the API through the public `/api/*` rewrite, and neither service makes a server-side call to the other. Therefore this configuration does not add a service binding. Both services receive public traffic only through their respective rewrite paths.

### 4. Deploy the frontend to Vercel with a Render API

1. In Vercel, import the same GitHub repository.
2. Set **Root Directory** to `client` and select Vite if prompted. The build command is `npm run build`; the output directory is `dist`.
3. Add the environment variable `VITE_API_BASE_URL` for **Production** and **Preview**:

   ```text
   https://<render-service>.onrender.com/api
   ```

4. Deploy the frontend.
5. Copy the deployed Vercel origin (for example `https://cropsphere.vercel.app`) and set it as `CLIENT_URL` in Render. Redeploy the API after changing the value.

`VITE_API_BASE_URL` is public and embedded in the frontend build; never put secrets in `VITE_` variables. If Clerk is enabled, configure its frontend publishable key in Vercel and its server-side secret in Render, and add your Vercel domain to Clerk's allowed origins.

### 5. Verify production

- Test account registration/login, product browsing, and cart behavior.
- Complete a Razorpay test-mode payment and confirm the order is stored as paid.
- Check Render logs and browser developer tools if API calls fail.
- Switch to Razorpay live keys only after test checkout succeeds and your Razorpay account is activated for live payments.

Production mode disables the in-memory local fallback. The API requires MongoDB to be available for database-backed routes and checkout.

---

## 🔑 Sign In and Create an Account

Sign in with the email address and password for an account already registered in the database, or choose **Create an account** on the sign-in page to register as a consumer or farmer. Admin accounts must be provisioned by an administrator; they cannot be created through public registration.

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs both backend and frontend concurrently in watch mode |
| `npm run dev:client` | Starts Vite dev server for the frontend (`http://localhost:5173`) |
| `npm run dev:server` | Starts Express backend with `tsx watch` (`http://localhost:5000`) |
| `npm run build` | Compiles both server TypeScript and client production bundle |
| `npm run seed` | Seeds database with demo farmers, products, and categories |
| `npm run lint` | Runs code quality checks (`oxlint` on client, `eslint` on server) |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
