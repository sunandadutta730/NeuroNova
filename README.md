# 🩸 LifeLink – Smart Blood Donor & Emergency Network

<div align="center">

![LifeLink Banner](https://img.shields.io/badge/LifeLink-Smart%20Blood%20Network-dc2626?style=for-the-badge)
![Firebase Connected](https://img.shields.io/badge/Backend-Google%20Firebase-ffca28?style=for-the-badge&logo=firebase)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Hackathon Ready](https://img.shields.io/badge/Status-Hackathon%20Production-10b981?style=for-the-badge)

**An intelligent, real-time blood donation matching & emergency dispatch platform built to reduce critical blood shortage response times.**

[Live Web App](https://neuronova-phi.vercel.app/) · [Report Bug](https://github.com/sunandadutta730/NeuroNova/issues) · [Request Feature](https://github.com/sunandadutta730/NeuroNova/issues)

</div>

---

## 📌 Problem Statement

Every year, thousands of critical medical emergencies — especially involving rare blood types such as **AB-**, **B-**, and **O-** — suffer severe delays due to fragmented communication between patients, hospitals, blood banks, and willing donors. Standard manual phone call chains take hours, while patients need matches in **minutes, not units**.

---

## ✨ Solution & Key Features

**LifeLink** bridges this gap by unifying donors, hospitals, emergency dispatchers, and blood bank inventories onto **one real-time cloud network**.

### 🌟 Core Highlights:
* 🩸 **Smart Compatibility Engine**: Instant multi-directional blood group compatibility resolution (Universal Donors vs. Receivers).
* 🚨 **Urgent Emergency Dispatcher**: Real-time emergency request broadcasting with urgency tiers (`Normal`, `Urgent`, `Critical`) and distance calculations.
* 🛡️ **Discrete Admin Control Center**: A secure, role-restricted admin portal accessible via custom authentication gate for managing donor registries, emergency requests, stock inventories, and shortage alerts.
* ⚡ **Google Firebase Realtime Sync**: Instant bi-directional cloud synchronization across all open client screens using Cloud Firestore.
* 🎨 **Hackathon-Grade Visual Aesthetics**: Modern dark/light glassmorphic UI, custom vector SVG icon system, pulse beacon animations, ECG waveform tracer, and staggered scroll reveal effects.

---

## 🛠️ Technology Stack

| Layer | Technology Used | Badges |
| :--- | :--- | :--- |
| **Frontend Core** | HTML5 Semantic Architecture, Vanilla JavaScript (ES6+ Single Page Application) | <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" /> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" /> |
| **Styling & Motion** | Custom CSS3 Modular Design System, Flexbox/Grid, Keyframe Animations | <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" /> |
| **Iconography** | Dynamic Inline High-Detail Vector SVG Icons Engine | <img src="https://img.shields.io/badge/SVG-000000?style=flat-square&logo=svg&logoColor=white" /> |
| **Cloud Backend** | Google Firebase (App, Cloud Firestore DB, Realtime Auth API) | <img src="https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black" /> |
| **Hosting & CI/CD** | GitHub Pages / Local HTTP Server | <img src="https://img.shields.io/badge/GitHub%20Pages-22272E?style=flat-square&logo=github&logoColor=white" /> |

---

## 🏗️ Architecture & Data Flow

```mermaid
graph TD
    A[Public Web User / Patient] -->|Submit Emergency Request| B(LifeLink Web SPA - js/app.js)
    C[Blood Donor] -->|Register Availability| B
    B -->|Bi-directional Sync| D[(Google Firebase Cloud Firestore)]
    D -->|Realtime Update broadcast| E[Admin Control Center]
    E -->|Manage Inventory & Donors| D
    D -->|Push Live Updates| A
```

---

## 📁 Clean & Scalable Directory Structure

```
LifeLink/
├── assets/                  # Static assets (images, icons, logos, fonts, animations, videos)
├── css/                     # Modular CSS (variables, components, forms, dashboard, responsive, style)
├── js/                      # Modular JS (app, firebase, auth, donor, receiver, hospital, admin, map, ui, utils, validation)
├── data/                    # Sample & mock data repositories (sample-data/donors.js)
├── docs/                    # API, Database, Structure & Deployment Documentation
├── config/                  # Configuration (constants.js, firebase-config.js)
├── index.html               # Main SPA HTML entry shell
├── README.md                # Project documentation & presentation guide
├── LICENSE                  # MIT Open Source License
├── .gitignore               # Excluded file list
├── .env.example             # Environment template
└── package.json             # NPM package manifest & scripts
```

Detailed architecture breakdown available in [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md).

---

## 🔐 Demo Admin Access Credentials

For hackathon evaluators, judges, and testing:

* **Admin Portal Gate**: Click `🔐 Login` in Header ➔ Select `Administrator` role tab.
* **Passcode**: `admin123`
* **Admin Capabilities**: Mark donors available/unavailable in real time, delete records, update emergency request status (`Pending` ➔ `In Progress` ➔ `Resolved`), adjust blood bank stock units, and publish platform-wide shortage alerts.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
* Any modern web browser (Google Chrome, Mozilla Firefox, Safari, Microsoft Edge).
* Local HTTP server (Python, VSCode Live Server, or Node http-server).

### Step 1: Clone Repository
```bash
git clone https://github.com/sunandadutta730/LifeLink.git
cd LifeLink
```

### Step 2: Launch Local Server
Using Python (Pre-installed on Windows/macOS/Linux):
```bash
python -m http.server 8080
```

### Step 3: Open in Browser
Navigate to `http://localhost:8080` in your browser.

---

## 🌐 GitHub Pages Hosting Setup Guide

To host this repository live for free on GitHub Pages:

1. Push all code to the `main` branch of your GitHub repository:
   ```bash
   git add .
   git commit -m "Deploy LifeLink Smart Blood Network"
   git push origin main
   ```
2. Go to your GitHub repository on `github.com`: **sunandadutta730/LifeLink**.
3. Click **Settings** ➔ **Pages** (under Code and automation).
4. Under **Build and deployment** ➔ **Source**, choose **Deploy from a branch**.
5. Select branch: `main` / folder: `/ (root)` ➔ Click **Save**.
6. Your live site will be published at: **`https://sunandadutta730.github.io/LifeLink/`**

---

## 📄 License & Credits

Designed & Developed with ❤️ by:
* **Sunanda Dutta**
* **Riddhika Ghosh**
* **Souham Dutta**

Built for the **Hackathon Competition**.  
Licensed under the [MIT License](LICENSE).
