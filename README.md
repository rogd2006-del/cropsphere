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
  - **1-Click Academic Evaluation Personas**: Instant login as **Mary Okonkwo (Farmer)**, **Alice Chen (Consumer)**, or **System Admin**.
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
   ```

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

## 🔑 Demo Personas for Quick Evaluation

The application includes an instant **1-Click Persona Switcher** in the top navigation banner for rapid evaluation without manual signup:

| Persona | Role | Features Accessible |
| :--- | :--- | :--- |
| **Mary Okonkwo** | Farmer | Inventory management, harvest updates, order dispatching, revenue in ₹ |
| **Alice Chen** | Consumer | Produce browsing, cart management, simulated checkout, order tracking |
| **System Admin** | Admin | User status toggling, platform-wide metrics, system audit logs |

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
