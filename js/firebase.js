/* ===== LifeLink Firebase Backend & Real-Time Cloud Sync System ===== */

let db = null;
let isFirebaseConnected = false;
window.firebaseReadyState = 'LOADING';

// Centralized In-Memory Firestore Collection Caches
let allUsersList = [];
let registeredDonors = [];
let receiversList = [];
let BLOOD_BANKS = [];
let bloodInventoryList = [];
let emergencyRequestsList = [];
let dispatchesList = [];
let notificationsList = [];
let donationsList = [];
let contractDonorsList = [];
let ngoPartnersList = [];
let bloodCollectionCampsList = [];
let bloodBankStaffList = [];
let activityLogsList = [];
let reportsList = [];
let systemSettings = {};
let moneyDonationsList = [];

function initFirebaseBackend() {
  if (typeof firebase !== 'undefined') {
    try {
      if (!firebase.apps.length) {
        const config = window.firebaseConfig;
        if (config && config.apiKey && config.projectId) {
          firebase.initializeApp(config);
          console.log('✅ Firebase SDK initialized successfully for project:', config.projectId);
        } else {
          console.warn('⚠️ Firebase configuration missing or invalid!');
          window.firebaseReadyState = 'UNAVAILABLE';
          return;
        }
      }
      
      db = firebase.firestore();
      isFirebaseConnected = true;
      window.firebaseReadyState = 'CONNECTED';
      updateCloudStatusBadge();

      // 1. users collection listener
      db.collection('users').onSnapshot((snapshot) => {
        allUsersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (typeof renderPage === 'function') renderPage();
      }, (err) => {
        console.warn('users snapshot listener error:', err.message);
      });

      // 2. donors collection listener
      db.collection('donors').onSnapshot((snapshot) => {
        registeredDonors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        isFirebaseConnected = true;
        window.firebaseReadyState = 'CONNECTED';
        updateCloudStatusBadge();
        if (typeof renderPage === 'function') renderPage();
      }, (err) => {
        console.warn('donors snapshot listener error:', err.message);
      });

      // 3. receivers collection listener
      db.collection('receivers').onSnapshot((snapshot) => {
        receiversList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }, (err) => {
        console.warn('receivers snapshot listener error:', err.message);
      });

      // 4. bloodBanks collection listener
      db.collection('bloodBanks').onSnapshot((snapshot) => {
        BLOOD_BANKS = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (typeof renderPage === 'function') renderPage();
      }, (err) => {
        console.warn('bloodBanks snapshot listener error:', err.message);
      });

      // 5. bloodInventory collection listener
      db.collection('bloodInventory').onSnapshot((snapshot) => {
        bloodInventoryList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (typeof renderPage === 'function') renderPage();
      }, (err) => {
        console.warn('bloodInventory snapshot listener error:', err.message);
      });

      // 6. bloodRequests collection listener
      db.collection('bloodRequests').onSnapshot((snapshot) => {
        emergencyRequestsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (typeof renderPage === 'function') renderPage();
      }, (err) => {
        console.warn('bloodRequests snapshot listener error:', err.message);
      });

      // 7. dispatches collection listener
      db.collection('dispatches').onSnapshot((snapshot) => {
        dispatchesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (typeof renderPage === 'function') renderPage();
      }, (err) => {
        console.warn('dispatches snapshot listener error:', err.message);
      });

      // 8. notifications collection listener
      db.collection('notifications').onSnapshot((snapshot) => {
        notificationsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (typeof renderPage === 'function') renderPage();
      }, (err) => {
        console.warn('notifications snapshot listener error:', err.message);
      });

      // 9. donations collection listener
      db.collection('donations').onSnapshot((snapshot) => {
        donationsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }, (err) => {
        console.warn('donations snapshot listener error:', err.message);
      });

      // 10. contractDonors collection listener
      db.collection('contractDonors').onSnapshot((snapshot) => {
        contractDonorsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }, (err) => {
        console.warn('contractDonors snapshot listener error:', err.message);
      });

      // 11. ngoPartners collection listener
      db.collection('ngoPartners').onSnapshot((snapshot) => {
        ngoPartnersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }, (err) => {
        console.warn('ngoPartners snapshot listener error:', err.message);
      });

      // 12. bloodCollectionCamps collection listener
      db.collection('bloodCollectionCamps').onSnapshot((snapshot) => {
        bloodCollectionCampsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }, (err) => {
        console.warn('bloodCollectionCamps snapshot listener error:', err.message);
      });

      // 13. bloodBankStaff collection listener
      db.collection('bloodBankStaff').onSnapshot((snapshot) => {
        bloodBankStaffList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }, (err) => {
        console.warn('bloodBankStaff snapshot listener error:', err.message);
      });

      // 14. activityLogs collection listener
      db.collection('activityLogs').onSnapshot((snapshot) => {
        activityLogsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }, (err) => {
        console.warn('activityLogs snapshot listener error:', err.message);
      });

      // 15. reports collection listener
      db.collection('reports').onSnapshot((snapshot) => {
        reportsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }, (err) => {
        console.warn('reports snapshot listener error:', err.message);
      });

      // 16. settings collection listener
      db.collection('settings').onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          systemSettings = snapshot.docs[0].data();
        }
      }, (err) => {
        console.warn('settings snapshot listener error:', err.message);
      });

      // 17. moneyDonations collection listener
      db.collection('moneyDonations').onSnapshot((snapshot) => {
        moneyDonationsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (typeof renderPage === 'function') renderPage();
      }, (err) => {
        console.warn('moneyDonations snapshot listener error:', err.message);
      });

    } catch (e) {
      console.warn('Firebase connection notice:', e.message);
      isFirebaseConnected = false;
      window.firebaseReadyState = 'FAILED';
      updateCloudStatusBadge();
    }
  } else {
    window.firebaseReadyState = 'UNAVAILABLE';
  }
}

// Immediately attempt initialization on script parse if firebase is defined
if (typeof firebase !== 'undefined' && window.firebaseConfig) {
  initFirebaseBackend();
}

// Helper to delete all documents in a collection
async function clearCollection(collectionName) {
  if (!db) return;
  try {
    const snap = await db.collection(collectionName).get();
    if (snap.empty) return;
    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log(`🗑️ Cleared "${collectionName}" (${snap.size} docs)`);
  } catch (e) {
    console.log(`⚠️ Could not clear "${collectionName}": ${e.message}`);
  }
}

let isSeedingProcessActive = false;

async function seedInitialFirestoreData() {
  if (!db || isSeedingProcessActive) return;
  isSeedingProcessActive = true;
  console.log('🌱 Firestore empty. Auto-seeding all 17 production collections...');

  try {
    const ALL_17 = [
      'users', 'donors', 'receivers', 'bloodBanks', 'bloodInventory',
      'bloodRequests', 'dispatches', 'notifications', 'donations',
      'contractDonors', 'ngoPartners', 'bloodCollectionCamps',
      'bloodBankStaff', 'activityLogs', 'reports', 'settings', 'moneyDonations'
    ];
    const LEGACY = ['admins', 'emergency', 'logins', 'blood_banks', 'users_and_donors'];

    for (const c of [...LEGACY, ...ALL_17]) {
      await clearCollection(c);
    }

    const batch = db.batch();
    const NOW = new Date().toISOString();

    // 1. users
    const usersData = [
      { id: 'USR-001', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', role: 'donor', city: 'Mumbai', blood: 'O+', createdAt: NOW },
      { id: 'USR-002', name: 'Priya Patel', email: 'priya@example.com', phone: '8765432109', role: 'donor', city: 'Delhi', blood: 'A+', createdAt: NOW },
      { id: 'USR-003', name: 'Apollo Blood Center Admin', email: 'apollo@lifelink.org', phone: '1134567890', role: 'blood_bank', city: 'Delhi', createdAt: NOW },
      { id: 'USR-004', name: 'System Admin', email: 'admin@lifelink.org', phone: '9900011223', role: 'admin', city: 'Mumbai', createdAt: NOW }
    ];
    usersData.forEach(u => batch.set(db.collection('users').doc(u.id), u));

    // 2. donors
    const donorsData = [
      { id: 'DNR-001', name: 'Rahul Sharma', blood: 'O+', city: 'Mumbai', phone: '+91 98765 43210', available: true, lastDonation: '2026-03-15', donations: 12, registeredAt: NOW },
      { id: 'DNR-002', name: 'Priya Patel', blood: 'A+', city: 'Delhi', phone: '+91 87654 32109', available: true, lastDonation: '2026-02-20', donations: 8, registeredAt: NOW },
      { id: 'DNR-003', name: 'Arjun Singh', blood: 'B+', city: 'Bangalore', phone: '+91 76543 21098', available: false, lastDonation: '2026-06-01', donations: 15, registeredAt: NOW },
      { id: 'DNR-004', name: 'Sneha Reddy', blood: 'AB-', city: 'Hyderabad', phone: '+91 65432 10987', available: true, lastDonation: '2025-12-10', donations: 6, registeredAt: NOW },
      { id: 'DNR-005', name: 'Amit Kumar', blood: 'O-', city: 'Chennai', phone: '+91 54321 09876', available: true, lastDonation: '2026-01-25', donations: 20, registeredAt: NOW },
      { id: 'DNR-006', name: 'Divya Nair', blood: 'B-', city: 'Kolkata', phone: '+91 43210 98765', available: true, lastDonation: '2026-04-05', donations: 10, registeredAt: NOW },
      { id: 'DNR-007', name: 'Karan Mehta', blood: 'A-', city: 'Pune', phone: '+91 32109 87654', available: false, lastDonation: '2026-05-20', donations: 5, registeredAt: NOW },
      { id: 'DNR-008', name: 'Ananya Gupta', blood: 'AB+', city: 'Ahmedabad', phone: '+91 21098 76543', available: true, lastDonation: '2025-11-18', donations: 9, registeredAt: NOW },
      { id: 'DNR-009', name: 'Vikram Joshi', blood: 'O+', city: 'Jaipur', phone: '+91 10987 65432', available: true, lastDonation: '2026-03-30', donations: 14, registeredAt: NOW },
      { id: 'DNR-010', name: 'Meera Iyer', blood: 'A+', city: 'Lucknow', phone: '+91 09876 54321', available: true, lastDonation: '2026-02-14', donations: 7, registeredAt: NOW }
    ];
    donorsData.forEach(d => batch.set(db.collection('donors').doc(d.id), d));

    // 3. receivers
    const receiversData = [
      { id: 'RCV-001', patientName: 'Rajesh Sharma', phone: '+91 98200 12345', city: 'Mumbai', hospital: 'Lilavati Hospital', createdAt: NOW }
    ];
    receiversData.forEach(r => batch.set(db.collection('receivers').doc(r.id), r));

    // 4. bloodBanks
    const bloodBanksData = [
      { id: 'BANK-001', name: 'Red Cross Blood Bank', parentHospital: 'Red Cross', category: 'Red Cross', licenseNumber: 'DL-BB-9842', contactPerson: 'Dr. Mehta', phone: '+91 22 2345 6789', email: 'mumbai@redcross.org', state: 'Maharashtra', city: 'Mumbai', location: 'Mumbai, Maharashtra', address: 'Bandra West, Mumbai', latitude: 19.0596, longitude: 72.8295, units: 135, bloods: { 'O+': 45, 'A+': 32, 'B+': 28, 'AB+': 12, 'O-': 5, 'A-': 8, 'B-': 3, 'AB-': 2 }, operational: true, registeredAt: NOW },
      { id: 'BANK-002', name: 'Apollo Blood Centre', parentHospital: 'Apollo Hospitals', category: 'Private Hospital', licenseNumber: 'DL-BB-3456', contactPerson: 'Dr. Verma', phone: '+91 11 3456 7890', email: 'apollo@lifelink.org', state: 'Delhi NCR', city: 'Delhi', location: 'Delhi, NCR', address: 'Sarita Vihar, New Delhi', latitude: 28.5355, longitude: 77.2880, units: 151, bloods: { 'O+': 52, 'A+': 38, 'B+': 22, 'AB+': 15, 'O-': 7, 'A-': 10, 'B-': 4, 'AB-': 3 }, operational: true, registeredAt: NOW },
      { id: 'BANK-003', name: 'Fortis Blood Bank', parentHospital: 'Fortis Healthcare', category: 'Private Hospital', licenseNumber: 'DL-BB-4567', contactPerson: 'Dr. Rao', phone: '+91 80 4567 8901', email: 'fortis.blr@lifelink.org', state: 'Karnataka', city: 'Bangalore', location: 'Bangalore, Karnataka', address: 'Bannerghatta Road, Bangalore', latitude: 12.8958, longitude: 77.5988, units: 113, bloods: { 'O+': 38, 'A+': 25, 'B+': 30, 'AB+': 8, 'O-': 3, 'A-': 6, 'B-': 2, 'AB-': 1 }, operational: true, registeredAt: NOW },
      { id: 'BANK-004', name: 'AIIMS Blood Centre', parentHospital: 'AIIMS', category: 'Government', licenseNumber: 'DL-BB-5678', contactPerson: 'Dr. Reddy', phone: '+91 40 5678 9012', email: 'aiims.hyd@lifelink.org', state: 'Telangana', city: 'Hyderabad', location: 'Hyderabad, Telangana', address: 'Jubilee Hills, Hyderabad', latitude: 17.4319, longitude: 78.4072, units: 184, bloods: { 'O+': 60, 'A+': 42, 'B+': 35, 'AB+': 18, 'O-': 8, 'A-': 12, 'B-': 5, 'AB-': 4 }, operational: true, registeredAt: NOW },
      { id: 'BANK-005', name: 'Tata Blood Bank', parentHospital: 'Tata Memorial', category: 'Charitable', licenseNumber: 'DL-BB-6789', contactPerson: 'Dr. Iyer', phone: '+91 44 6789 0123', email: 'tata.che@lifelink.org', state: 'Tamil Nadu', city: 'Chennai', location: 'Chennai, Tamil Nadu', address: 'T Nagar, Chennai', latitude: 13.0418, longitude: 80.2341, units: 93, bloods: { 'O+': 33, 'A+': 20, 'B+': 18, 'AB+': 10, 'O-': 4, 'A-': 5, 'B-': 2, 'AB-': 1 }, operational: true, registeredAt: NOW }
    ];
    bloodBanksData.forEach(b => batch.set(db.collection('bloodBanks').doc(b.id), b));

    // 5. bloodInventory
    const inventoryData = [
      { id: 'INV-001', bankId: 'BANK-001', bloodGroup: 'O+', componentType: 'Whole Blood', availableUnits: 45, reservedUnits: 5, status: 'ADEQUATE', updatedAt: NOW },
      { id: 'INV-002', bankId: 'BANK-001', bloodGroup: 'O-', componentType: 'RBC (PRBC)', availableUnits: 5, reservedUnits: 1, status: 'LOW_STOCK', updatedAt: NOW },
      { id: 'INV-003', bankId: 'BANK-002', bloodGroup: 'A+', componentType: 'Whole Blood', availableUnits: 38, reservedUnits: 2, status: 'ADEQUATE', updatedAt: NOW },
      { id: 'INV-004', bankId: 'BANK-002', bloodGroup: 'AB-', componentType: 'Platelets', availableUnits: 3, reservedUnits: 1, status: 'CRITICAL', updatedAt: NOW }
    ];
    inventoryData.forEach(inv => batch.set(db.collection('bloodInventory').doc(inv.id), inv));

    // 6. bloodRequests
    const requestsData = [
      { id: 'REQ-001', patient: 'Rajesh Sharma',    patientName: 'Rajesh Sharma',    blood: 'O+',  bloodGroup: 'O+',  hospital: 'Lilavati Hospital',        hospitalName: 'Lilavati Hospital',        city: 'Mumbai',    phone: '+91 98200 12345', contactPhone: '+91 98200 12345', units: 4, urgency: 'critical', status: 'PENDING',   acceptedBy: null, dispatchStatus: 'NOT_DISPATCHED', patientConfirmed: false, bankConfirmed: false, progressTimeline: [{ step: 'Request Submitted', time: NOW }], createdAt: NOW },
      { id: 'REQ-002', patient: 'Sunita Patel',     patientName: 'Sunita Patel',     blood: 'AB-', bloodGroup: 'AB-', hospital: 'Max Super Speciality',      hospitalName: 'Max Super Speciality',      city: 'Delhi',     phone: '+91 98111 54321', contactPhone: '+91 98111 54321', units: 2, urgency: 'critical', status: 'ACCEPTED',  acceptedBy: { bankId: 'BANK-002', bankName: 'Apollo Blood Centre', acceptedTime: NOW }, dispatchStatus: 'DISPATCHED', patientConfirmed: false, bankConfirmed: true, progressTimeline: [{ step: 'Request Submitted', time: NOW }, { step: 'Accepted by Apollo Blood Centre', time: NOW }], createdAt: NOW },
      { id: 'REQ-003', patient: 'Vikram Malhotra',  patientName: 'Vikram Malhotra',  blood: 'B+',  bloodGroup: 'B+',  hospital: 'Manipal Hospital',          hospitalName: 'Manipal Hospital',          city: 'Bangalore', phone: '+91 98450 99887', contactPhone: '+91 98450 99887', units: 5, urgency: 'urgent',   status: 'COMPLETED', acceptedBy: { bankId: 'BANK-003', bankName: 'Fortis Blood Bank', acceptedTime: NOW }, dispatchStatus: 'DELIVERED', patientConfirmed: true, bankConfirmed: true, progressTimeline: [{ step: 'Request Submitted', time: NOW }, { step: 'Completed', time: NOW }], createdAt: NOW },
      { id: 'REQ-004', patient: 'Meera Krishnan',   patientName: 'Meera Krishnan',   blood: 'A+',  bloodGroup: 'A+',  hospital: 'Apollo Hospitals',          hospitalName: 'Apollo Hospitals',          city: 'Chennai',   phone: '+91 94450 77123', contactPhone: '+91 94450 77123', units: 3, urgency: 'urgent',   status: 'PENDING',   acceptedBy: null, dispatchStatus: 'NOT_DISPATCHED', patientConfirmed: false, bankConfirmed: false, progressTimeline: [{ step: 'Request Submitted', time: NOW }], createdAt: NOW },
      { id: 'REQ-005', patient: 'Arjun Nair',       patientName: 'Arjun Nair',       blood: 'O-',  bloodGroup: 'O-',  hospital: 'Fortis Hospital',           hospitalName: 'Fortis Hospital',           city: 'Hyderabad', phone: '+91 99887 33210', contactPhone: '+91 99887 33210', units: 2, urgency: 'critical', status: 'ACCEPTED',  acceptedBy: { bankId: 'BANK-004', bankName: 'AIIMS Blood Centre', acceptedTime: NOW }, dispatchStatus: 'NOT_DISPATCHED', patientConfirmed: false, bankConfirmed: false, progressTimeline: [{ step: 'Request Submitted', time: NOW }, { step: 'Accepted by AIIMS Blood Centre', time: NOW }], createdAt: NOW },
      { id: 'REQ-006', patient: 'Preethi Suresh',   patientName: 'Preethi Suresh',   blood: 'B-',  bloodGroup: 'B-',  hospital: 'KMC Hospital',              hospitalName: 'KMC Hospital',              city: 'Mangalore', phone: '+91 91234 56789', contactPhone: '+91 91234 56789', units: 2, urgency: 'urgent',   status: 'PENDING',   acceptedBy: null, dispatchStatus: 'NOT_DISPATCHED', patientConfirmed: false, bankConfirmed: false, progressTimeline: [{ step: 'Request Submitted', time: NOW }], createdAt: NOW },
      { id: 'REQ-007', patient: 'Deepak Joshi',     patientName: 'Deepak Joshi',     blood: 'AB+', bloodGroup: 'AB+', hospital: 'Kokilaben Hospital',        hospitalName: 'Kokilaben Hospital',        city: 'Mumbai',    phone: '+91 97654 32100', contactPhone: '+91 97654 32100', units: 3, urgency: 'moderate', status: 'PENDING',   acceptedBy: null, dispatchStatus: 'NOT_DISPATCHED', patientConfirmed: false, bankConfirmed: false, progressTimeline: [{ step: 'Request Submitted', time: NOW }], createdAt: NOW },
      { id: 'REQ-008', patient: 'Kavya Reddy',      patientName: 'Kavya Reddy',      blood: 'A-',  bloodGroup: 'A-',  hospital: 'Yashoda Hospital',          hospitalName: 'Yashoda Hospital',          city: 'Hyderabad', phone: '+91 88776 55443', contactPhone: '+91 88776 55443', units: 2, urgency: 'urgent',   status: 'PENDING',   acceptedBy: null, dispatchStatus: 'NOT_DISPATCHED', patientConfirmed: false, bankConfirmed: false, progressTimeline: [{ step: 'Request Submitted', time: NOW }], createdAt: NOW },
      { id: 'REQ-009', patient: 'Rahul Desai',      patientName: 'Rahul Desai',      blood: 'O+',  bloodGroup: 'O+',  hospital: 'Breach Candy Hospital',     hospitalName: 'Breach Candy Hospital',     city: 'Mumbai',    phone: '+91 98765 43200', contactPhone: '+91 98765 43200', units: 3, urgency: 'critical', status: 'COMPLETED', acceptedBy: { bankId: 'BANK-001', bankName: 'Red Cross Blood Bank', acceptedTime: NOW }, dispatchStatus: 'DELIVERED', patientConfirmed: true, bankConfirmed: true, progressTimeline: [{ step: 'Request Submitted', time: NOW }, { step: 'Completed', time: NOW }], createdAt: NOW },
      { id: 'REQ-010', patient: 'Simran Kaur',      patientName: 'Simran Kaur',      blood: 'B+',  bloodGroup: 'B+',  hospital: 'PGI Chandigarh',            hospitalName: 'PGI Chandigarh',            city: 'Chandigarh',phone: '+91 76543 21000', contactPhone: '+91 76543 21000', units: 4, urgency: 'urgent',   status: 'ACCEPTED',  acceptedBy: { bankId: 'BANK-003', bankName: 'Fortis Blood Bank', acceptedTime: NOW }, dispatchStatus: 'DISPATCHED', patientConfirmed: false, bankConfirmed: true, progressTimeline: [{ step: 'Request Submitted', time: NOW }, { step: 'Accepted', time: NOW }], createdAt: NOW },
      { id: 'REQ-011', patient: 'Ananya Sharma',    patientName: 'Ananya Sharma',    blood: 'A+',  bloodGroup: 'A+',  hospital: 'AIIMS New Delhi',           hospitalName: 'AIIMS New Delhi',           city: 'Delhi',     phone: '+91 87654 31100', contactPhone: '+91 87654 31100', units: 2, urgency: 'critical', status: 'PENDING',   acceptedBy: null, dispatchStatus: 'NOT_DISPATCHED', patientConfirmed: false, bankConfirmed: false, progressTimeline: [{ step: 'Request Submitted', time: NOW }], createdAt: NOW },
      { id: 'REQ-012', patient: 'Suresh Nambiar',   patientName: 'Suresh Nambiar',   blood: 'AB-', bloodGroup: 'AB-', hospital: 'Amrita Hospital',           hospitalName: 'Amrita Hospital',           city: 'Kochi',     phone: '+91 94400 22334', contactPhone: '+91 94400 22334', units: 1, urgency: 'moderate', status: 'PENDING',   acceptedBy: null, dispatchStatus: 'NOT_DISPATCHED', patientConfirmed: false, bankConfirmed: false, progressTimeline: [{ step: 'Request Submitted', time: NOW }], createdAt: NOW }
    ];
    requestsData.forEach(req => batch.set(db.collection('bloodRequests').doc(req.id), req));

    // 7. dispatches
    const dispatchesData = [
      { id: 'DSP-001', requestId: 'REQ-002', bankId: 'BANK-002', driverName: 'Rajesh Transport', status: 'IN_TRANSIT', dispatchedAt: NOW }
    ];
    dispatchesData.forEach(d => batch.set(db.collection('dispatches').doc(d.id), d));

    // 8. notifications
    const notificationsData = [
      { id: 'NTF-001', targetRole: 'bank', title: '🚨 Emergency Request: O+ (2 Units)', message: 'Urgent request for patient Rajesh Sharma at Lilavati Hospital, Mumbai.', type: 'EMERGENCY', timestamp: NOW, read: false, requestId: 'REQ-001' },
      { id: 'NTF-002', targetRole: 'all', title: '📢 Low Stock Alert', message: 'AB- and O- blood levels running critically low in Delhi and Mumbai.', type: 'SYSTEM_ALERT', timestamp: NOW, read: false }
    ];
    notificationsData.forEach(n => batch.set(db.collection('notifications').doc(n.id), n));

    // 9. donations
    const donationsData = [
      { id: 'DON-001', donorId: 'DNR-001', bankId: 'BANK-001', bloodGroup: 'O+', units: 1, donationDate: '2026-03-15', status: 'COMPLETED', createdAt: NOW }
    ];
    donationsData.forEach(don => batch.set(db.collection('donations').doc(don.id), don));

    // 10. contractDonors
    const contractDonorsData = [
      { id: 'CDN-001', bankId: 'BANK-001', donorName: 'Amit Kumar', bloodGroup: 'O-', phone: '+91 98765 11111', lastDonation: '2026-01-15', status: 'Ready to Donate' },
      { id: 'CDN-002', bankId: 'BANK-001', donorName: 'Priya Patel', bloodGroup: 'A+', phone: '+91 98765 22222', lastDonation: '2026-02-10', status: 'Ready to Donate' }
    ];
    contractDonorsData.forEach(cd => batch.set(db.collection('contractDonors').doc(cd.id), cd));

    // 11. ngoPartners
    const ngoPartnersData = [
      { id: 'NGO-001', bankId: 'BANK-001', ngoName: 'Indian Red Cross Youth', coverageArea: 'All Districts', coordinatorName: 'Rajesh Patel', coordinatorPhone: '+91 98200 12345' },
      { id: 'NGO-002', bankId: 'BANK-001', ngoName: 'Lions Club Blood Mission', coverageArea: 'Metro Zone', coordinatorName: 'Sunita Sharma', coordinatorPhone: '+91 98200 54321' }
    ];
    ngoPartnersData.forEach(ngo => batch.set(db.collection('ngoPartners').doc(ngo.id), ngo));

    // 12. bloodCollectionCamps
    const campsData = [
      { id: 'CMP-001', bankId: 'BANK-001', title: 'Mega Corporate Blood Drive', location: 'BKC Tech Park, Mumbai', date: '2026-08-15', targetUnits: 200, registeredDonors: 140, collectedUnits: 0, status: 'UPCOMING' },
      { id: 'CMP-002', bankId: 'BANK-001', title: 'Rotary Club Mobile Drive', location: 'Powai Community Hall', date: '2026-07-20', targetUnits: 150, registeredDonors: 165, collectedUnits: 165, status: 'COMPLETED' }
    ];
    campsData.forEach(cmp => batch.set(db.collection('bloodCollectionCamps').doc(cmp.id), cmp));

    // 13. bloodBankStaff
    const staffData = [
      { id: 'STF-001', bankId: 'BANK-001', staffName: 'Dr. Rajesh Mehta', role: 'Nodal Officer', email: 'rajesh.mehta@redcross.org', phone: '+91 98200 88776' }
    ];
    staffData.forEach(stf => batch.set(db.collection('bloodBankStaff').doc(stf.id), stf));

    // 14. activityLogs
    const logsData = [
      { id: 'LOG-001', action: 'SYSTEM_BOOTSTRAP', performedBy: 'System', role: 'admin', timestamp: NOW, details: 'Initialized 17 production Firestore collections' }
    ];
    logsData.forEach(log => batch.set(db.collection('activityLogs').doc(log.id), log));

    // 15. reports
    const reportsData = [
      { id: 'RPT-001', bankId: 'BANK-001', month: '2026-07', totalCollected: 450, totalDispatched: 410, expiryRate: '0.8%', generatedAt: NOW }
    ];
    reportsData.forEach(rpt => batch.set(db.collection('reports').doc(rpt.id), rpt));

    // 16. settings
    const settingsData = [
      { id: 'sys_config', emergencyRadiusKm: 50, autoMatchEnabled: true, lowStockThreshold: 10, updatedAt: NOW }
    ];
    settingsData.forEach(st => batch.set(db.collection('settings').doc(st.id), st));

    // 17. moneyDonations
    const moneyDonationsData = [
      { id: 'MNY-001', donorName: 'Rahul Sharma', amount: 2500, purpose: 'Emergency Blood Processing Support', transactionId: 'TXN-9842145', timestamp: NOW },
      { id: 'MNY-002', donorName: 'Priya Patel', amount: 5000, purpose: 'Mobile Camp Equipment Fund', transactionId: 'TXN-9842146', timestamp: NOW }
    ];
    moneyDonationsData.forEach(mny => batch.set(db.collection('moneyDonations').doc(mny.id), mny));

    await batch.commit();
    isFirebaseConnected = true;
    updateCloudStatusBadge();
    if (typeof showToast === 'function') {
      showToast('🎉 All 17 production Firestore collections seeded!', 'success');
    }
  } catch (err) {
    console.error('Error auto-seeding Firestore:', err);
  } finally {
    isSeedingProcessActive = false;
  }
}

window.seedNow = async function () {
  if (!db) { console.error('Firebase not connected'); return; }
  await seedInitialFirestoreData();
  if (typeof renderPage === 'function') renderPage();
};

function updateCloudStatusBadge() {
  const badge = document.getElementById('cloud-status-badge');
  if (badge) {
    badge.innerHTML = isFirebaseConnected
      ? `<span style="color:#10b981; display:inline-flex; align-items:center; gap:4px;">${SVG_ICONS.check(14, '#10b981')} Firebase Live Sync</span>`
      : `<span style="color:#f59e0b; display:inline-flex; align-items:center; gap:4px;">⚡ Offline Fallback</span>`;
  }
}

function logActivity(action, performedBy, role, details) {
  if (!db) return;
  db.collection('activityLogs').add({
    action,
    performedBy: performedBy || 'Anonymous',
    role: role || 'user',
    details: details || '',
    timestamp: new Date().toISOString()
  }).catch(() => {});
}

function saveUserAccountToFirebase(userAccount) {
  if (!db) return;
  const NOW = new Date().toISOString();

  // Save to users collection
  db.collection('users').add({
    ...userAccount,
    createdAt: NOW
  }).then(ref => console.log('✅ Account saved to users:', ref.id))
    .catch(err => console.error('❌ users save error:', err));

  // If role is donor, save to donors collection
  if (userAccount.role === 'donor' || userAccount.role === 'user') {
    db.collection('donors').add({
      name: userAccount.name,
      email: userAccount.email,
      phone: userAccount.phone,
      blood: userAccount.blood || 'O+',
      city: userAccount.city || 'Mumbai',
      available: true,
      donations: 0,
      lastDonation: null,
      registeredAt: NOW
    }).then(ref => console.log('✅ Donor saved to donors:', ref.id))
      .catch(err => console.error('❌ donors save error:', err));
  }

  logActivity('USER_REGISTERED', userAccount.name || userAccount.email, userAccount.role || 'user', `Registered via ${userAccount.provider || 'email'}`);
}

function saveUserLoginToFirebase(loginTrack) {
  if (!db) return;
  logActivity('USER_LOGIN', loginTrack.name || loginTrack.email, loginTrack.role || 'user', `User logged in at ${new Date().toLocaleString()}`);
}

function saveMoneyDonationToFirebase(donationData) {
  if (!db) return;
  db.collection('moneyDonations').add({
    ...donationData,
    timestamp: new Date().toISOString()
  }).then(ref => console.log('✅ Money donation saved:', ref.id))
    .catch(err => console.error('❌ moneyDonations error:', err));

  logActivity('MONEY_DONATION', donationData.donorName, 'donor', `Donated ₹${donationData.amount} for ${donationData.purpose}`);
}
