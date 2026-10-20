# Golden Hour SOS

> **"Right patient. Right hospital. Right time."**

An emergency medical dispatch and intelligent clinical triage platform designed to optimize survival outcomes during the critical Golden Hour window (STEMI myocardial infarction, acute stroke, polytrauma accidents, respiratory distress).

---

## 🌟 Architecture & Map Upgrades

1. **Guaranteed Leaflet 2D Tactical Map Engine (Always Visible & Reliable)**
   - **CARTO Dark Matter Tiles:** High-contrast dark tiles (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`) matching the dark navy medical cockpit theme (`#0A1A3C`).
   - **Automatic OSM Failover:** Built-in error monitoring detects 3 tile errors and dynamically falls back to standard OpenStreetMap tiles (`https://tile.openstreetmap.org/`) with a `"Using backup map"` indicator badge.
   - **Zero-PNG DivIcons:** Custom `L.divIcon` markers eliminating bundler asset path breakages:
     - **Patient Marker:** Glowing cyan SOS pin with concentric pulsating rings.
     - **Recommended Hospital:** High-priority red `H+` beacon with prominent ping pulse.
     - **Partner Hospitals:** Bed-count badged pins colored green (high capacity) or amber (constrained).
     - **Real OSM Hospitals Layer:** Overpass/OSM public registry nodes toggleable with 1 click.
     - **Road Route Polyline:** Smooth red `#FF4D5A` road polyline rendered with glow underlayer and animated moving ambulance indicator.
   - **Interactive Popups & 1-Click Select:** Click any hospital pin on the map to inspect ICU beds, trauma bays, Cath Lab readiness, and set it as the primary dispatch target.
   - **Fail-Proof Sizing:** Immediate `invalidateSize()` invocations with a container `ResizeObserver` so the map never renders blank or half-loaded across viewport changes.

2. **Everywhere Map Integration**
   - **Citizen SOS App:** Embedded live radar right below clinical triage, displaying recommended route and nearby facilities before dispatch.
   - **Hospital ER Desk:** Dedicated live incoming radar showing ambulance position and countdown ETA to the trauma bay.
   - **Public Case Tracking (`#/case/:code`):** Shareable link for family members and dispatchers to monitor live ambulance GPS progress in real-time.
   - **Dedicated Live Route Console:** Fullscreen-capable tactical view with "Locate Me", "Fit Route", "Reset North", and layer toggles.

3. **3D Hero & Visual Polish**
   - **Interactive 3D Hero Model:** Three.js procedural ambulance and emergency beacon visualizer on the SOS screen with drag-to-rotate interaction.
   - **Intense Red Pulse SOS Button:** `.sos-btn.pulse-intense` with aggressive multi-layer keyframe glow for high-stress visibility.
   - **Tactile Voice Feedback Hook:** Web Audio API synthesized dual-thump heartbeat (`playHeartbeatThump()`) providing haptic-like acoustic feedback when the bystander starts voice-to-text dictation.

4. **Full-Stack Real-time Architecture**
   - **Socket.IO Live Synchronization:** Immediate dispatch synchronization between Citizen SOS and Hospital ER dashboards.
   - **Optional PostgreSQL Persistence:** Persistent storage via `DATABASE_URL` with automatic table creation and seamless fallback to memory storage for instant zero-config evaluation.
   - **Gemini Clinical AI Triage:** Structured extraction of emergency category, severity (CRITICAL/HIGH/MODERATE), required specialists, Cath Lab standby, and bilingual first-aid steps (English & தமிழ்).

---

## 🚀 Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Build production assets
npm run build

# 3. Start full-stack server
npm start
```

Open your browser at `http://localhost:3000`.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```env
# Gemini API Key (injected automatically in Google AI Studio)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Server Port (default 3000)
PORT=3000

# Optional PostgreSQL Connection (falls back to memory if omitted)
DATABASE_URL="postgres://user:password@localhost:5432/golden_hour"
```
