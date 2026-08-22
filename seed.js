// LifeLink Firebase Seed Script - 17 Collections
// Run: node seed.js
// Deletes old collections and populates all 17 production collections in Firestore

const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, writeBatch } = require('firebase/firestore');

// Load environment variables from .env file if available
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valParts] = trimmed.split('=');
      if (key && valParts.length > 0) {
        process.env[key.trim()] = valParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
}

const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

// Helper to delete all documents in a collection
async function deleteCollection(collectionName) {
  try {
    const snap = await getDocs(collection(db, collectionName));
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log(`  🗑️ Cleared "${collectionName}" (${snap.size} docs)`);
  } catch (e) {
    console.log(`  ⚠️ Could not delete "${collectionName}": ${e.message}`);
  }
}

const NOW = new Date().toISOString();

// ALL 17 COLLECTIONS SCHEMA SEED DEFINITIONS
const ALL_COLLECTIONS = [
  'users',
  'donors',
  'receivers',
  'bloodBanks',
  'bloodInventory',
  'bloodRequests',
  'dispatches',
  'notifications',
  'donations',
  'contractDonors',
  'ngoPartners',
  'bloodCollectionCamps',
  'bloodBankStaff',
  'activityLogs',
  'reports',
  'settings',
  'moneyDonations'
];

// Legacy collections to cleanup if present
const LEGACY_COLLECTIONS = [
  'admins', 'emergency', 'logins', 'blood_banks', 'users_and_donors',
  'emergency_requests', 'registered_donors', 'all_users', 'login_details'
];

async function seedFreshSystem() {
  console.log('\n🧹 STEP 1: Deleting old & legacy collections...');
  for (const c of [...LEGACY_COLLECTIONS, ...ALL_COLLECTIONS]) {
    await deleteCollection(c);
  }

  console.log('\n🌱 STEP 2: Seeding 17 production Firestore collections...\n');

  // 1. users
  const usersSeed = [
    { id: 'USR-001', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', role: 'donor', city: 'Mumbai', blood: 'O+', createdAt: NOW },
    { id: 'USR-002', name: 'Priya Patel', email: 'priya@example.com', phone: '8765432109', role: 'donor', city: 'Delhi', blood: 'A+', createdAt: NOW },
    { id: 'USR-003', name: 'Lilavati Blood Center Admin', email: 'lilavati@lifelink.org', phone: '2223456789', role: 'blood_bank', city: 'Mumbai', createdAt: NOW },
    { id: 'USR-004', name: 'LifeLink System Admin', email: 'admin@lifelink.org', phone: '9900011223', role: 'admin', city: 'Mumbai', createdAt: NOW },
    { id: 'USR-005', name: 'Rajesh Sharma (Patient)', email: 'rajesh@example.com', phone: '9820012345', role: 'receiver', city: 'Mumbai', createdAt: NOW }
  ];
  for (const u of usersSeed) {
    await setDoc(doc(db, 'users', u.id), u);
  }
  console.log('✅ 1. users — seeded', usersSeed.length, 'records');

  // 2. donors
  const donorsSeed = [
    { id: 'DNR-001', userId: 'USR-001', name: 'Rahul Sharma', blood: 'O+', city: 'Mumbai', phone: '+91 98765 43210', available: true, verified: true, verificationStatus: 'APPROVED', lastDonation: '2026-03-15', donations: 12, registeredAt: NOW },
    { id: 'DNR-002', userId: 'USR-002', name: 'Priya Patel', blood: 'A+', city: 'Delhi', phone: '+91 87654 32109', available: true, verified: true, verificationStatus: 'APPROVED', lastDonation: '2026-02-20', donations: 8, registeredAt: NOW },
    { id: 'DNR-003', userId: null, name: 'Arjun Singh', blood: 'B+', city: 'Bangalore', phone: '+91 76543 21098', available: false, verified: true, verificationStatus: 'APPROVED', lastDonation: '2026-06-01', donations: 15, registeredAt: NOW },
    { id: 'DNR-004', userId: null, name: 'Sneha Reddy', blood: 'AB-', city: 'Hyderabad', phone: '+91 65432 10987', available: true, verified: true, verificationStatus: 'APPROVED', lastDonation: '2025-12-10', donations: 6, registeredAt: NOW },
    { id: 'DNR-005', userId: null, name: 'Amit Kumar', blood: 'O-', city: 'Chennai', phone: '+91 54321 09876', available: true, verified: true, verificationStatus: 'APPROVED', lastDonation: '2026-01-25', donations: 20, registeredAt: NOW },
    { id: 'DNR-006', userId: null, name: 'Divya Nair', blood: 'B-', city: 'Kolkata', phone: '+91 43210 98765', available: true, verified: true, verificationStatus: 'APPROVED', lastDonation: '2026-04-05', donations: 10, registeredAt: NOW },
    { id: 'DNR-007', userId: null, name: 'Karan Mehta', blood: 'A-', city: 'Pune', phone: '+91 32109 87654', available: false, verified: true, verificationStatus: 'APPROVED', lastDonation: '2026-05-20', donations: 5, registeredAt: NOW },
    { id: 'DNR-008', userId: null, name: 'Ananya Gupta', blood: 'AB+', city: 'Ahmedabad', phone: '+91 21098 76543', available: true, verified: true, verificationStatus: 'APPROVED', lastDonation: '2025-11-18', donations: 9, registeredAt: NOW },
    { id: 'DNR-009', userId: null, name: 'Vikram Joshi', blood: 'O+', city: 'Jaipur', phone: '+91 10987 65432', available: true, verified: true, verificationStatus: 'APPROVED', lastDonation: '2026-03-30', donations: 14, registeredAt: NOW },
    { id: 'DNR-010', userId: null, name: 'Meera Iyer', blood: 'A+', city: 'Lucknow', phone: '+91 09876 54321', available: true, verified: true, verificationStatus: 'APPROVED', lastDonation: '2026-02-14', donations: 7, registeredAt: NOW }
  ];
  for (const d of donorsSeed) {
    await setDoc(doc(db, 'donors', d.id), d);
  }
  console.log('✅ 2. donors — seeded', donorsSeed.length, 'records');

  // 3. receivers
  const receiversSeed = [
    { id: 'RCV-001', userId: 'USR-005', patientName: 'Rajesh Sharma', phone: '+91 98200 12345', city: 'Mumbai', hospital: 'Lilavati Hospital', createdAt: NOW }
  ];
  for (const r of receiversSeed) {
    await setDoc(doc(db, 'receivers', r.id), r);
  }
  console.log('✅ 3. receivers — seeded', receiversSeed.length, 'records');

  // 4. bloodBanks
  const bloodBanksSeed = [
    { id: 'BANK-001', name: 'Red Cross Blood Bank', parentHospital: 'Red Cross Society', category: 'Red Cross', licenseNumber: 'DL-BB-9842', contactPerson: 'Dr. Mehta', phone: '+91 22 2345 6789', email: 'mumbai@redcross.org', state: 'Maharashtra', city: 'Mumbai', location: 'Mumbai, Maharashtra', address: 'Bandra West, Mumbai', latitude: 19.0596, longitude: 72.8295, units: 135, bloods: { 'O+': 45, 'A+': 32, 'B+': 28, 'AB+': 12, 'O-': 5, 'A-': 8, 'B-': 3, 'AB-': 2 }, operational: true, registeredAt: NOW },
    { id: 'BANK-002', name: 'Apollo Blood Centre', parentHospital: 'Apollo Hospitals', category: 'Private Hospital', licenseNumber: 'DL-BB-3456', contactPerson: 'Dr. Verma', phone: '+91 11 3456 7890', email: 'apollo@lifelink.org', state: 'Delhi NCR', city: 'Delhi', location: 'Delhi, NCR', address: 'Sarita Vihar, New Delhi', latitude: 28.5355, longitude: 77.2880, units: 151, bloods: { 'O+': 52, 'A+': 38, 'B+': 22, 'AB+': 15, 'O-': 7, 'A-': 10, 'B-': 4, 'AB-': 3 }, operational: true, registeredAt: NOW },
    { id: 'BANK-003', name: 'Fortis Blood Bank', parentHospital: 'Fortis Healthcare', category: 'Private Hospital', licenseNumber: 'DL-BB-4567', contactPerson: 'Dr. Rao', phone: '+91 80 4567 8901', email: 'fortis.blr@lifelink.org', state: 'Karnataka', city: 'Bangalore', location: 'Bangalore, Karnataka', address: 'Bannerghatta Road, Bangalore', latitude: 12.8958, longitude: 77.5988, units: 113, bloods: { 'O+': 38, 'A+': 25, 'B+': 30, 'AB+': 8, 'O-': 3, 'A-': 6, 'B-': 2, 'AB-': 1 }, operational: true, registeredAt: NOW },
    { id: 'BANK-004', name: 'AIIMS Blood Centre', parentHospital: 'AIIMS', category: 'Government', licenseNumber: 'DL-BB-5678', contactPerson: 'Dr. Reddy', phone: '+91 40 5678 9012', email: 'aiims.hyd@lifelink.org', state: 'Telangana', city: 'Hyderabad', location: 'Hyderabad, Telangana', address: 'Jubilee Hills, Hyderabad', latitude: 17.4319, longitude: 78.4072, units: 184, bloods: { 'O+': 60, 'A+': 42, 'B+': 35, 'AB+': 18, 'O-': 8, 'A-': 12, 'B-': 5, 'AB-': 4 }, operational: true, registeredAt: NOW },
    { id: 'BANK-005', name: 'Tata Blood Bank', parentHospital: 'Tata Memorial', category: 'Charitable', licenseNumber: 'DL-BB-6789', contactPerson: 'Dr. Iyer', phone: '+91 44 6789 0123', email: 'tata.che@lifelink.org', state: 'Tamil Nadu', city: 'Chennai', location: 'Chennai, Tamil Nadu', address: 'T Nagar, Chennai', latitude: 13.0418, longitude: 80.2341, units: 93, bloods: { 'O+': 33, 'A+': 20, 'B+': 18, 'AB+': 10, 'O-': 4, 'A-': 5, 'B-': 2, 'AB-': 1 }, operational: true, registeredAt: NOW }
  ];
  for (const b of bloodBanksSeed) {
    await setDoc(doc(db, 'bloodBanks', b.id), b);
  }
  console.log('✅ 4. bloodBanks — seeded', bloodBanksSeed.length, 'records');

  // 5. bloodInventory
  const inventorySeed = [
    { id: 'INV-001', bankId: 'BANK-001', bloodGroup: 'O+', componentType: 'Whole Blood', availableUnits: 45, reservedUnits: 5, status: 'ADEQUATE', updatedAt: NOW },
    { id: 'INV-002', bankId: 'BANK-001', bloodGroup: 'O-', componentType: 'RBC (PRBC)', availableUnits: 5, reservedUnits: 1, status: 'LOW_STOCK', updatedAt: NOW },
    { id: 'INV-003', bankId: 'BANK-002', bloodGroup: 'A+', componentType: 'Whole Blood', availableUnits: 38, reservedUnits: 2, status: 'ADEQUATE', updatedAt: NOW },
    { id: 'INV-004', bankId: 'BANK-002', bloodGroup: 'AB-', componentType: 'Platelets', availableUnits: 3, reservedUnits: 1, status: 'CRITICAL', updatedAt: NOW }
  ];
  for (const inv of inventorySeed) {
    await setDoc(doc(db, 'bloodInventory', inv.id), inv);
  }
  console.log('✅ 5. bloodInventory — seeded', inventorySeed.length, 'records');

  // 6. bloodRequests
  const requestsSeed = [
    { id: 'REQ-001', patient: 'Rajesh Sharma', patientName: 'Rajesh Sharma', blood: 'O+', bloodGroup: 'O+', hospital: 'Lilavati Hospital', hospitalName: 'Lilavati Hospital', city: 'Mumbai', phone: '+91 98200 12345', contactPhone: '+91 98200 12345', units: 2, urgency: 'critical', status: 'PENDING', acceptedBy: null, dispatchStatus: 'NOT_DISPATCHED', patientConfirmed: false, bankConfirmed: false, progressTimeline: [{ step: 'Request Submitted', time: NOW }], createdAt: NOW },
    { id: 'REQ-002', patient: 'Sunita Patel', patientName: 'Sunita Patel', blood: 'AB-', bloodGroup: 'AB-', hospital: 'Max Super Speciality', hospitalName: 'Max Super Speciality', city: 'Delhi', phone: '+91 98111 54321', contactPhone: '+91 98111 54321', units: 1, urgency: 'critical', status: 'ACCEPTED', acceptedBy: { bankId: 'BANK-002', bankName: 'Apollo Blood Centre', acceptedTime: NOW }, dispatchStatus: 'DISPATCHED', patientConfirmed: false, bankConfirmed: true, progressTimeline: [{ step: 'Request Submitted', time: NOW }, { step: 'Accepted by Apollo Blood Centre', time: NOW }], createdAt: NOW },
    { id: 'REQ-003', patient: 'Vikram Malhotra', patientName: 'Vikram Malhotra', blood: 'B+', bloodGroup: 'B+', hospital: 'Manipal Hospital', hospitalName: 'Manipal Hospital', city: 'Bangalore', phone: '+91 98450 99887', contactPhone: '+91 98450 99887', units: 3, urgency: 'urgent', status: 'COMPLETED', acceptedBy: { bankId: 'BANK-003', bankName: 'Fortis Blood Bank', acceptedTime: NOW }, dispatchStatus: 'DELIVERED', patientConfirmed: true, bankConfirmed: true, progressTimeline: [{ step: 'Request Submitted', time: NOW }, { step: 'Completed', time: NOW }], createdAt: NOW }
  ];
  for (const req of requestsSeed) {
    await setDoc(doc(db, 'bloodRequests', req.id), req);
  }
  console.log('✅ 6. bloodRequests — seeded', requestsSeed.length, 'records');

  // 7. dispatches
  const dispatchesSeed = [
    { id: 'DSP-001', requestId: 'REQ-002', bankId: 'BANK-002', driverName: 'Rajesh Transport', status: 'IN_TRANSIT', dispatchedAt: NOW }
  ];
  for (const d of dispatchesSeed) {
    await setDoc(doc(db, 'dispatches', d.id), d);
  }
  console.log('✅ 7. dispatches — seeded', dispatchesSeed.length, 'records');

  // 8. notifications
  const notificationsSeed = [
    { id: 'NTF-001', targetRole: 'bank', title: '🚨 Emergency Request: O+ (2 Units)', message: 'Urgent request for patient Rajesh Sharma at Lilavati Hospital, Mumbai.', type: 'EMERGENCY', timestamp: NOW, read: false, requestId: 'REQ-001' },
    { id: 'NTF-002', targetRole: 'all', title: '📢 Low Stock Alert', message: 'AB- and O- blood levels running critically low in Delhi and Mumbai.', type: 'SYSTEM_ALERT', timestamp: NOW, read: false }
  ];
  for (const n of notificationsSeed) {
    await setDoc(doc(db, 'notifications', n.id), n);
  }
  console.log('✅ 8. notifications — seeded', notificationsSeed.length, 'records');

  // 9. donations
  const donationsSeed = [
    { id: 'DON-001', donorId: 'DNR-001', bankId: 'BANK-001', bloodGroup: 'O+', units: 1, donationDate: '2026-03-15', status: 'COMPLETED', createdAt: NOW },
    { id: 'DON-002', donorId: 'DNR-005', bankId: 'BANK-005', bloodGroup: 'O-', units: 1, donationDate: '2026-01-25', status: 'COMPLETED', createdAt: NOW }
  ];
  for (const don of donationsSeed) {
    await setDoc(doc(db, 'donations', don.id), don);
  }
  console.log('✅ 9. donations — seeded', donationsSeed.length, 'records');

  // 10. contractDonors
  const contractDonorsSeed = [
    { id: 'CDN-001', bankId: 'BANK-001', donorName: 'Amit Kumar', bloodGroup: 'O-', phone: '+91 98765 11111', lastDonation: '2026-01-15', status: 'Ready to Donate' },
    { id: 'CDN-002', bankId: 'BANK-001', donorName: 'Priya Patel', bloodGroup: 'A+', phone: '+91 98765 22222', lastDonation: '2026-02-10', status: 'Ready to Donate' }
  ];
  for (const cd of contractDonorsSeed) {
    await setDoc(doc(db, 'contractDonors', cd.id), cd);
  }
  console.log('✅ 10. contractDonors — seeded', contractDonorsSeed.length, 'records');

  // 11. ngoPartners
  const ngoPartnersSeed = [
    { id: 'NGO-001', bankId: 'BANK-001', ngoName: 'Indian Red Cross Youth', coverageArea: 'All Districts', coordinatorName: 'Rajesh Patel', coordinatorPhone: '+91 98200 12345' },
    { id: 'NGO-002', bankId: 'BANK-001', ngoName: 'Lions Club Blood Mission', coverageArea: 'Metro Zone', coordinatorName: 'Sunita Sharma', coordinatorPhone: '+91 98200 54321' }
  ];
  for (const ngo of ngoPartnersSeed) {
    await setDoc(doc(db, 'ngoPartners', ngo.id), ngo);
  }
  console.log('✅ 11. ngoPartners — seeded', ngoPartnersSeed.length, 'records');

  // 12. bloodCollectionCamps
  const campsSeed = [
    { id: 'CMP-001', bankId: 'BANK-001', title: 'Mega Corporate Blood Drive', location: 'BKC Tech Park, Mumbai', date: '2026-08-15', targetUnits: 200, registeredDonors: 140, collectedUnits: 0, status: 'UPCOMING' },
    { id: 'CMP-002', bankId: 'BANK-001', title: 'Rotary Club Mobile Drive', location: 'Powai Community Hall', date: '2026-07-20', targetUnits: 150, registeredDonors: 165, collectedUnits: 165, status: 'COMPLETED' }
  ];
  for (const cmp of campsSeed) {
    await setDoc(doc(db, 'bloodCollectionCamps', cmp.id), cmp);
  }
  console.log('✅ 12. bloodCollectionCamps — seeded', campsSeed.length, 'records');

  // 13. bloodBankStaff
  const staffSeed = [
    { id: 'STF-001', bankId: 'BANK-001', staffName: 'Dr. Rajesh Mehta', role: 'Nodal Officer', email: 'rajesh.mehta@redcross.org', phone: '+91 98200 88776' }
  ];
  for (const stf of staffSeed) {
    await setDoc(doc(db, 'bloodBankStaff', stf.id), stf);
  }
  console.log('✅ 13. bloodBankStaff — seeded', staffSeed.length, 'records');

  // 14. activityLogs
  const logsSeed = [
    { id: 'LOG-001', action: 'SYSTEM_BOOTSTRAP', performedBy: 'System', role: 'admin', timestamp: NOW, details: 'Initialized 17 production Firestore collections' }
  ];
  for (const log of logsSeed) {
    await setDoc(doc(db, 'activityLogs', log.id), log);
  }
  console.log('✅ 14. activityLogs — seeded', logsSeed.length, 'records');

  // 15. reports
  const reportsSeed = [
    { id: 'RPT-001', bankId: 'BANK-001', month: '2026-07', totalCollected: 450, totalDispatched: 410, expiryRate: '0.8%', generatedAt: NOW }
  ];
  for (const rpt of reportsSeed) {
    await setDoc(doc(db, 'reports', rpt.id), rpt);
  }
  console.log('✅ 15. reports — seeded', reportsSeed.length, 'records');

  // 16. settings
  const settingsSeed = [
    { id: 'sys_config', emergencyRadiusKm: 50, autoMatchEnabled: true, lowStockThreshold: 10, updatedAt: NOW }
  ];
  for (const st of settingsSeed) {
    await setDoc(doc(db, 'settings', st.id), st);
  }
  console.log('✅ 16. settings — seeded', settingsSeed.length, 'records');

  // 17. moneyDonations
  const moneyDonationsSeed = [
    { id: 'MNY-001', donorName: 'Rahul Sharma', amount: 2500, purpose: 'Emergency Blood Processing Support', transactionId: 'TXN-9842145', timestamp: NOW },
    { id: 'MNY-002', donorName: 'Priya Patel', amount: 5000, purpose: 'Mobile Camp Equipment Fund', transactionId: 'TXN-9842146', timestamp: NOW }
  ];
  for (const mny of moneyDonationsSeed) {
    await setDoc(doc(db, 'moneyDonations', mny.id), mny);
  }
  console.log('✅ 17. moneyDonations — seeded', moneyDonationsSeed.length, 'records');

  console.log('\n🎉 ALL 17 COLLECTIONS CREATED AND SEEDED IN FIREBASE FIRESTORE!\n');
  process.exit(0);
}

seedFreshSystem().catch(e => { console.error('❌ Seed failed:', e); process.exit(1); });
