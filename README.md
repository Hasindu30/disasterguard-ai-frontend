# 🛡️ DisasterGuard AI — Frontend

React + TypeScript frontend for the DisasterGuard AI early warning system. Features real-time disaster risk assessment, interactive maps, live weather data, and emergency resource location.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 + Custom CSS (Glassmorphism) |
| Routing | React Router v7 |
| Maps | Leaflet + React-Leaflet |
| Charts | Recharts |
| Icons | Lucide React |
| Email | EmailJS (password reset) |
| HTTP | Axios |

## 📁 Project Structure

```
frontend/
├── public/
│   ├── hero_disaster_map.png    # Landing page hero image
│   ├── command_center.png       # Feature card image
│   ├── flood_warning.png        # Feature card image
│   └── weather_data.png         # Feature card image
├── src/
│   ├── components/
│   │   └── Sidebar.tsx          # Navigation sidebar
│   ├── context/
│   │   └── AuthContext.tsx      # Global auth state + axios instance
│   ├── pages/
│   │   ├── LandingPage.tsx      # Public landing page
│   │   ├── LoginPage.tsx        # Login with glassmorphism UI
│   │   ├── RegisterPage.tsx     # Register with password strength
│   │   ├── ForgotPasswordPage.tsx  # 3-step password reset flow
│   │   ├── Dashboard.tsx        # Main dashboard with stats
│   │   ├── RiskMapPage.tsx      # Interactive Leaflet risk map
│   │   ├── LocationSearchPage.tsx  # Location risk assessment
│   │   ├── EmergencyResourcesPage.tsx  # Find nearby resources
│   │   ├── AlertHistoryPage.tsx    # Alert log
│   │   └── AdminDashboard.tsx   # Admin management panel
│   ├── App.tsx                  # Router + layout shell
│   ├── index.css                # Global styles + design system
│   └── main.tsx                 # React entry point
├── .env.example                 # Environment variable template
├── index.html
├── package.json
└── vite.config.ts
```

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/disasterguard-frontend.git
cd disasterguard-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` with your EmailJS keys (for password reset emails):
```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_API_URL=http://localhost:5000
```

### 4. Make sure the backend is running
The frontend connects to the backend at `http://localhost:5000` by default.
See [disasterguard-backend](https://github.com/YOUR_USERNAME/disasterguard-backend) for setup.

### 5. Run in development mode
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### 6. Build for production
```bash
npm run build
```

## 🌟 Key Features

| Feature | Description |
|---------|-------------|
| 🔐 Authentication | JWT-based login, register, and forgot password with EmailJS |
| 🗺️ Interactive Map | Click anywhere on a Leaflet map to calculate disaster risk |
| 🌧️ Live Weather | Real-time rainfall, wind speed, temperature via Open-Meteo API |
| 📅 Rain Forecast | 3-day future rain predictions for any searched location |
| 🔴 Risk Scoring | AI formula combining weather + flood history + elevation |
| 🏥 Emergency Resources | Find nearby hospitals, fire stations, and shelters |
| 🔔 Alert System | Auto-generated alerts for Medium/High risk assessments |
| 👑 Admin Panel | User management and system-wide alert monitoring |

## 🎨 Design System

The UI uses a custom **Glassmorphism** design system defined in `index.css`:
- Dark base: `#0f172a` (slate-950)
- Glass cards: `background: rgba(15,23,42,0.6)` with `backdrop-filter: blur`
- Accent color: Red (`#ef4444`) + Orange (`#f97316`)
- Typography: Inter (Google Fonts)
- Animations: Fade-in, pulse, spin, ping

## 📦 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_EMAILJS_SERVICE_ID` | Yes (for email) | Your EmailJS Service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | Yes (for email) | Your EmailJS Template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | Yes (for email) | Your EmailJS Public Key |
| `VITE_API_URL` | Optional | Backend URL (default: http://localhost:5000) |

> **EmailJS Setup:** Sign up at [emailjs.com](https://www.emailjs.com), create a service + template with a `{{temporaryPassword}}` variable, and paste the keys above.

## 🔗 Related Repository

- **Backend:** [disasterguard-backend](https://github.com/YOUR_USERNAME/disasterguard-backend)

## 📄 License
MIT
