# LifeLink — Firebase Connection & Data Transfer Architecture

> **Project:** LifeLink Smart Blood Donor Network  
> **Firebase Project ID:** `lifeline-2026`  
> **Firestore Location:** `asia-south1`  
> **SDK Version:** Firebase 9 Compat (CDN)

---

## 1. Firebase Initialization Path

### How Firebase Connects on Page Load

```
index.html (page loads)
  └─► <script> in index.html sets window.firebaseConfig
  └─► <script src="firebase SDKs" (CDN)>
        firebase-app.js
        firebase-firestore.js
        firebase-auth.js
  └─► js/firebase.js is loaded
        └─► initFirebaseBackend() runs automatically:
              firebase.apps.length === 0?
                └─► YES → firebase.initializeApp(window.firebaseConfig)
              db = firebase.firestore()
              isFirebaseConnected = true
              window.firebaseReadyState = 'CONNECTED'
              Attach 17 real-time onSnapshot listeners
```

### Firebase Config Object (set in `index.html`)

```javascript
window.firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "lifeline-2026.firebaseapp.com",
  projectId:         "lifeline-2026",
  storageBucket:     "lifeline-2026.appspot.com",
  messagingSenderId: "...",
  appId:             "..."
};
```

> All Firestore reads/writes pass through the `db` global variable (the `firebase.firestore()` instance).

---

## 2. Real-Time Data Listeners — All 17 Collections

Every collection uses `onSnapshot()` which streams live changes from Firestore into in-memory JavaScript arrays that the UI reads for rendering.

| # | Firestore Collection | In-Memory Variable | Re-renders Page |
|---|---------------------|--------------------|-----------------|
| 1 | `users` | `allUsersList[]` | Yes |
| 2 | `donors` | `registeredDonors[]` | Yes |
| 3 | `receivers` | `receiversList[]` | No |
| 4 | `bloodBanks` | `BLOOD_BANKS[]` | Yes |
| 5 | `bloodInventory` | `bloodInventoryList[]` | Yes |
| 6 | `bloodRequests` | `emergencyRequestsList[]` | Yes |
| 7 | `dispatches` | `dispatchesList[]` | Yes |
| 8 | `notifications` | `notificationsList[]` | Yes |
| 9 | `donations` | `donationsList[]` | No |
| 10 | `contractDonors` | `contractDonorsList[]` | No |
| 11 | `ngoPartners` | `ngoPartnersList[]` | No |
| 12 | `bloodCollectionCamps` | `bloodCollectionCampsList[]` | No |
| 13 | `bloodBankStaff` | `bloodBankStaffList[]` | No |
| 14 | `activityLogs` | `activityLogsList[]` | No |
| 15 | `reports` | `reportsList[]` | No |
| 16 | `settings` | `systemSettings{}` | No |
| 17 | `moneyDonations` | `moneyDonationsList[]` | Yes |

### How onSnapshot Works

```
Firestore Cloud (Google Server)
       |
       |  Real-time WebSocket / gRPC stream
       v
  onSnapshot listener (in js/firebase.js)
       |
       |  snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
       v
  In-Memory Array (e.g., registeredDonors[])
       |
       |  renderPage() called -> UI re-renders
       v
  Browser DOM Updated (live data reflected instantly)
```

---

## 3. Complete Data Flow Diagrams

### 3.1 Donor Registration Flow

```
User fills Donor Registration Form
  └─► handleRegister(e) in js/donor.js
        └─► isUserAuthenticated()?
              └─► NO  -> requireUserAuth() -> openAuthModal() -> Login first
              └─► YES -> Validate form data (phone, duplicates)
                    └─► Build newDonor object:
                          { id, name, blood, city, phone, available, lastDonation, donations, registeredAt }
                    └─► db.collection('donors').doc(newDonor.id).set(newDonor)
                          └─► Firestore: /donors/{DNR-XXXXXX}
                    └─► db.collection('users').add({ name, phone, blood, city, role:'donor', createdAt })
                          └─► Firestore: /users/{auto-id}
                    └─► showRegistrationSuccessModal(newDonor)
                    └─► onSnapshot fires -> registeredDonors[] updated -> UI re-renders
```

### 3.2 Emergency Blood Request Flow

```
User fills Emergency Request Form
  └─► handleEmergencyRequest(e) in js/receiver.js
        └─► isUserAuthenticated()?
              └─► NO  -> requireUserAuth() -> openAuthModal() -> Login first
              └─► YES -> Validate phone, get urgency level
                    └─► Build newReq object:
                          { id, patient, blood, hospital, city, phone, units, urgency,
                            status:'PENDING', progressTimeline[], createdAt }
                    └─► db.collection('bloodRequests').doc(reqId).set(newReq)
                          └─► Firestore: /bloodRequests/{REQ-XXXX}
                    └─► db.collection('notifications').add({
                              targetRole:'bank',
                              title: 'Emergency Request',
                              type: 'EMERGENCY',
                              requestId: reqId
                          })
                          └─► Firestore: /notifications/{auto-id}
                    └─► showToast('Emergency request broadcasted!')
                    └─► onSnapshot fires -> emergencyRequestsList[] updated -> Blood Bank Portal re-renders
```

### 3.3 Blood Bank Accepts Request Flow

```
Blood Bank clicks "Accept Request" in Bank Portal
  └─► acceptEmergencyRequest(reqId) in js/bank-portal.js
        └─► currentBloodBankSession must be set (bank logged in)
        └─► Find request in emergencyRequestsList[]
        └─► Build updatePayload:
              { status:'ACCEPTED',
                acceptedBy: { bankId, bankName, acceptedTime },
                acceptedBankId, acceptedBankName, acceptedAt,
                progressTimeline: [..., { step:'Accepted by Bank', time }] }
        └─► db.collection('bloodRequests').doc(reqId).update(updatePayload)
              └─► Firestore: /bloodRequests/{reqId} — updated in-place
        └─► onSnapshot fires -> emergencyRequestsList[] updated
              └─► Patient's Emergency page shows "ACCEPTED" status
              └─► Blood Bank portal shows accepted request
```

### 3.4 Blood Bank Dispatches Blood Flow

```
Blood Bank clicks "Mark as Dispatched" in Bank Portal
  └─► markAsDispatched(reqId) in js/bank-portal.js
        └─► db.collection('bloodRequests').doc(reqId).update({
                dispatchStatus: 'DISPATCHED',
                progressTimeline: [..., { step:'Blood Dispatched', time }]
            })
              └─► Firestore: /bloodRequests/{reqId}
        └─► db.collection('dispatches').add({
                requestId: reqId,
                bankId: currentBloodBankSession.id,
                status: 'IN_TRANSIT',
                dispatchedAt: NOW
            })
              └─► Firestore: /dispatches/{auto-id}
        └─► onSnapshot fires -> dispatchesList[] updated -> UI reflects IN_TRANSIT
```

### 3.5 Double Confirmation Delivery Flow (Bank + Patient)

```
Both Bank AND Patient must confirm delivery to mark COMPLETED

Blood Bank clicks "Confirm Delivered":
  └─► confirmBankDelivery(reqId) in js/bank-portal.js
        └─► db.collection('bloodRequests').doc(reqId).update({
                bankConfirmed: true,
                bloodBankDelivered: true,
                progressTimeline: [..., { step:'Blood Bank Confirmed Delivery', time }]
            })
        └─► If req.patientConfirmed === true:
              └─► db.collection('bloodRequests').doc(reqId).update({
                      status: 'COMPLETED',
                      deliveryStatus: 'FULLY_DELIVERED',
                      completedAt: NOW
                  })

Patient clicks "Confirm Receipt":
  └─► confirmPatientReceipt(reqId) in js/receiver.js
        └─► db.collection('bloodRequests').doc(reqId).update({
                patientConfirmed: true,
                status: 'AWAITING_FINAL_CONFIRMATION' (or 'COMPLETED' if bank already confirmed)
            })
```

### 3.6 User Authentication Flow (Google / Email)

```
User clicks "Login / Sign Up"
  └─► openAuthModal('login' | 'signup', 'user') in js/auth.js

  [Google Auth Path]
        └─► handleGoogleAuth()
              └─► firebase.auth().signInWithPopup(GoogleAuthProvider)
                    └─► Firebase Auth -> Google OAuth -> returns user
              └─► Checks allUsersList[] for existing account by email
              └─► completeLoginProcess(accountObj, role)
                    └─► currentUserAccount = accountObj
                    └─► localStorage.setItem('lifelink_current_user', ...)
                    └─► saveUserAccountToFirebase(userAccount)
                          └─► db.collection('users').add({...})        -> /users/{auto-id}
                          └─► db.collection('donors').add({...})       -> /donors/{auto-id}
                    └─► logActivity('USER_LOGIN', ...)
                          └─► db.collection('activityLogs').add({...}) -> /activityLogs/{auto-id}
                    └─► window.pendingPostLoginAction?.() — resumes any pending action

  [Email Auth Path]
        └─► handleEmailSignup() / handleEmailLogin()
              └─► firebase.auth().createUserWithEmailAndPassword(email, password)
              └─► OR firebase.auth().signInWithEmailAndPassword(email, password)
              └─► completeLoginProcess(accountObj, role)
```

### 3.7 Financial Donation Flow

```
User submits "Support LifeLink Mission" form
  └─► handleMoneyDonation(e) in js/receiver.js
        └─► isUserAuthenticated()?
              └─► NO  -> requireUserAuth() -> openAuthModal()
              └─► YES -> Validate amount > 0
                    └─► Build donationData:
                          { id, donorName, amount, purpose, transactionId, timestamp }
                    └─► saveMoneyDonationToFirebase(donationData)
                          └─► db.collection('moneyDonations').add({...})
                                └─► Firestore: /moneyDonations/{auto-id}
                          └─► logActivity('MONEY_DONATION', donorName, 'donor', ...)
                                └─► Firestore: /activityLogs/{auto-id}
```

---

## 4. Collection Schema Reference

### /donors/{donorId}

```json
{
  "id":           "DNR-001",
  "name":         "Rahul Sharma",
  "blood":        "O+",
  "city":         "Mumbai",
  "phone":        "+91 98765 43210",
  "available":    true,
  "lastDonation": "2026-03-15",
  "donations":    12,
  "registeredAt": "2026-08-12T..."
}
```

### /bloodRequests/{requestId}

```json
{
  "id":                 "REQ-001",
  "patient":            "Rajesh Sharma",
  "blood":              "O+",
  "hospital":           "Lilavati Hospital",
  "city":               "Mumbai",
  "phone":              "+91 98200 12345",
  "units":              2,
  "urgency":            "critical",
  "status":             "PENDING | ACCEPTED | AWAITING_FINAL_CONFIRMATION | COMPLETED",
  "acceptedBy":         null,
  "acceptedBankId":     null,
  "acceptedBankName":   null,
  "acceptedAt":         null,
  "dispatchStatus":     "NOT_DISPATCHED | DISPATCHED | IN_TRANSIT | DELIVERED",
  "patientConfirmed":   false,
  "bankConfirmed":      false,
  "bloodBankDelivered": false,
  "deliveryStatus":     null,
  "progressTimeline":   [{ "step": "Request Submitted", "time": "..." }],
  "completedAt":        null,
  "createdAt":          "2026-08-12T..."
}
```

### /bloodBanks/{bankId}

```json
{
  "id":            "BANK-001",
  "name":          "Red Cross Blood Bank",
  "licenseNumber": "DL-BB-9842",
  "email":         "mumbai@redcross.org",
  "phone":         "+91 22 2345 6789",
  "city":          "Mumbai",
  "location":      "Mumbai, Maharashtra",
  "units":         135,
  "bloods": {
    "O+": 45, "A+": 32, "B+": 28, "AB+": 12,
    "O-": 5,  "A-": 8,  "B-": 3,  "AB-": 2
  },
  "operational":  true,
  "registeredAt": "2026-08-12T..."
}
```

### /activityLogs/{logId}

```json
{
  "action":      "USER_LOGIN | USER_REGISTERED | MONEY_DONATION | SYSTEM_BOOTSTRAP",
  "performedBy": "Rahul Sharma",
  "role":        "donor | admin | bank",
  "details":     "User logged in at ...",
  "timestamp":   "2026-08-12T..."
}
```

### /moneyDonations/{donationId}

```json
{
  "id":            "MNY-001",
  "donorName":     "Rahul Sharma",
  "amount":        2500,
  "purpose":       "Emergency Blood Processing Support",
  "transactionId": "TXN-9842145",
  "timestamp":     "2026-08-12T..."
}
```

---

## 5. Security Rules Summary

| Collection | Public Read | Public Write | Auth-Only Write |
|:-----------|:-----------:|:------------:|:---------------:|
| `users` | Yes | Yes (create) | Yes (update/delete) |
| `donors` | Yes | Yes (create) | Yes (update/delete) |
| `bloodBanks` | Yes | Yes (create) | Yes (update/delete) |
| `bloodRequests` | Yes | Yes (create/update) | Yes (delete) |
| `bloodInventory` | Yes | Yes (create/update) | Yes (delete) |
| `dispatches` | Yes | Yes (create/update) | Yes (delete) |
| `notifications` | Yes | Yes (create) | Yes (update/delete) |
| `moneyDonations` | Yes | Yes (create) | Yes (update/delete) |
| `activityLogs` | Yes | Yes (create) | Yes (update/delete) |
| `settings` | Yes | No | Yes (all) |

---

## 6. Firebase Connection Status States

| `window.firebaseReadyState` | Meaning |
|:----------------------------|:--------|
| `LOADING` | Firebase JS SDK is loading |
| `CONNECTED` | Firestore is live, 17 onSnapshot listeners active |
| `FAILED` | `initializeApp()` threw an error |
| `UNAVAILABLE` | Firebase SDK not found in window or config missing |

The `#cloud-status-badge` element in the Dashboard shows **Firebase Live Sync** (green) or **Offline Fallback** (amber) based on `isFirebaseConnected`.

---

## 7. Write Function Reference

| Function | File | Collection(s) Written |
|:---------|:-----|:----------------------|
| `handleRegister(e)` | js/donor.js | `donors`, `users` |
| `handleEmergencyRequest(e)` | js/receiver.js | `bloodRequests`, `notifications` |
| `acceptEmergencyRequest(reqId)` | js/bank-portal.js | `bloodRequests` |
| `markAsDispatched(reqId)` | js/bank-portal.js | `bloodRequests`, `dispatches` |
| `confirmBankDelivery(reqId)` | js/bank-portal.js | `bloodRequests` |
| `confirmPatientReceipt(reqId)` | js/receiver.js | `bloodRequests` |
| `handleGoogleAuth()` | js/auth.js | `users`, `donors`, `activityLogs` |
| `handleMoneyDonation(e)` | js/receiver.js | `moneyDonations`, `activityLogs` |
| `saveUserAccountToFirebase()` | js/firebase.js | `users`, `donors` |
| `saveUserLoginToFirebase()` | js/firebase.js | `activityLogs` |
| `logActivity()` | js/firebase.js | `activityLogs` |
| `seedInitialFirestoreData()` | js/firebase.js | All 17 collections (dev seed) |

---

## 8. JS File Dependency & Load Order

```
index.html
  |
  |-- Firebase CDN Scripts
  |       firebase-app.js
  |       firebase-firestore.js
  |       firebase-auth.js
  |
  +-- JS Module Load Order:
       1. js/firebase.js    <- DB init + 17 onSnapshot listeners + write helpers
       2. js/auth.js        <- Auth state + login modal + requireUserAuth()
       3. js/bank-auth.js   <- Blood Bank session management
       4. js/ui.js          <- navigateTo() + renderPage() + toggleMobileMenu()
       5. js/donor.js       <- Donor registration + renderFind() + renderRegister()
       6. js/receiver.js    <- Emergency request + money donation
       7. js/bank-portal.js <- Bank acceptance + dispatch + delivery confirmation
       8. js/admin.js       <- Admin dashboard metrics + renderAdmin()
       9. js/dashboard.js   <- renderDashboard() + stats charts
      10. js/app.js         <- renderHome() + renderCompatibility() + renderBanks() + renderAwareness()
      11. js/utils.js       <- Shared helpers: SVG_ICONS, showToast, validate10DigitPhone, etc.
```
