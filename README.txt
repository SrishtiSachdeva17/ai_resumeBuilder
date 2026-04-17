╔══════════════════════════════════════════════════════════╗
║            AI Resume Builder - Setup Guide               ║
╚══════════════════════════════════════════════════════════╝

FOLDER STRUCTURE (after extracting zip):
─────────────────────────────────────────
  AI-Resume-Builder/
  ├── START.bat          ← Double click this to run!
  ├── INSTALL_MONGODB.bat
  ├── README.txt
  ├── backend/
  └── frontend/

STEP 1 — Install Node.js
─────────────────────────
  Download from: https://nodejs.org  (LTS version)
  Install it, then come back here.

STEP 2 — Install MongoDB
─────────────────────────
  Double-click: INSTALL_MONGODB.bat
  OR manually: https://www.mongodb.com/try/download/community
  During install → select "Complete" → keep "Install as Service" CHECKED

STEP 3 — Run the App
─────────────────────
  Double-click: START.bat
  Wait for two windows to open (Backend + Frontend)
  Browser will open http://localhost:3000 automatically

STEP 4 — Use the App
─────────────────────
  1. Click Register → create your account
  2. Create a new resume
  3. Fill in your details
  4. Download as PDF

TROUBLESHOOTING
────────────────
  "Cannot find path backend"
  → Make sure you extracted the zip first!
  → START.bat must be in same folder as backend/ and frontend/

  "MongoDB connection failed"
  → Run INSTALL_MONGODB.bat first
  → Or run: net start MongoDB  in CMD as Administrator

  Port already in use
  → Open CMD and type:
      npx kill-port 3000
      npx kill-port 5000
  → Then run START.bat again
