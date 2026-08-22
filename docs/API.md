# 🔌 LifeLink API & Module Reference Guide

This document describes the client-side API functions and module interfaces used across **LifeLink**.

---

## 🔑 Core API Handlers

### 1. Authentication (`js/auth.js`)
* `openAuthModal(mode, role)` — Opens the sign-up or log-in modal for user or administrator role.
* `handleAuthSignup(e, role)` — Validates 10-digit mobile number, checks local & cloud duplicate records, creates user account.
* `handleAuthLogin(e, role)` — Validates email and password against Firebase Auth / local storage, or validates admin passcode (`admin123`).
* `handleGoogleAuth()` — Triggers Google OAuth popup using Firebase Web Auth Provider (`GoogleAuthProvider`).
* `handleUserLogout()` — Clears authentication session, signs out of Firebase Auth, updates UI header.

### 2. Donor Operations (`js/donor.js`)
* `handleRegister(e)` — Validates registration input, enforces 10-digit phone requirement, prevents duplicate phone/email registration, writes to `donors` collection.
* `filterDonors()` — Filters active donor list by blood group, city, and availability status.
* `checkDonationEligibility()` — Calculates days since last donation and renders eligibility badges.

### 3. Emergency Dispatcher (`js/receiver.js`)
* `handleEmergencyRequest(e)` — Validates request form, sets urgency tier (`normal`, `urgent`, `critical`), broadcasts request to `emergency` collection.

### 4. Blood Banks & Compatibility (`js/hospital.js`)
* `updateCompatibilityView()` — Computes universal donor / receiver matches for selected blood type.
* `renderBanks()` — Displays blood bank inventory counts and contact information.

### 5. Admin Control Center (`js/admin.js`)
* `adminToggleDonorStatus(index)` — Toggles donor availability status and syncs update to Firestore.
* `adminUpdateReqStatus(index, newStatus)` — Updates emergency request status (`In Progress`, `Resolved`).
* `adminUpdateStock(index, delta)` — Increments or decrements blood bank unit stock.

### 6. Cloud Backend & Utilities (`js/firebase.js`, `js/utils.js`)
* `initFirebaseBackend()` — Connects to Firebase Firestore and initializes realtime snapshot listeners.
* `showToast(message, type)` — Renders floating toast notifications.
* `SVG_ICONS` — Inline SVG icon generator system.
