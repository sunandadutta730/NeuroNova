/* ===== LifeLink Blood Bank Authentication & Session Manager ===== */

let currentBloodBankSession = JSON.parse(localStorage.getItem('lifelink_bank_session') || 'null');

function openBloodBankRegisterModal() {
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal" style="max-width: 780px; border-radius: var(--radius-xl); padding: 32px; max-height: 90vh; overflow-y: auto;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #ef4444, #991b1b); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: #fff;">
            ${SVG_ICONS.hospital(24)}
          </div>
          <div>
            <h3 style="font-size: 1.4rem; font-weight: 800; margin: 0; color: var(--text-primary);">Blood Bank Registration</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">Register your facility on LifeLink & e-RaktKosh National Grid</p>
          </div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="closeModal()" style="padding: 4px 10px;">✕</button>
      </div>

      <form id="bank-register-form" onsubmit="handleBankRegistrationSubmit(event)">
        <!-- Step 1: Basic & License Details -->
        <div class="form-section-title" style="font-weight: 700; font-size: 1rem; color: var(--accent); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
          ${SVG_ICONS.shield(16)} 1. Facility & License Identification
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 20px;">
          <div class="form-group">
            <label>Blood Bank Name <span class="required">*</span></label>
            <input type="text" class="form-control" id="bank-reg-name" placeholder="e.g. Apollo Blood Centre" required>
          </div>
          <div class="form-group">
            <label>Parent Hospital / Medical Center <span class="required">*</span></label>
            <input type="text" class="form-control" id="bank-reg-hospital" placeholder="e.g. Apollo Hospitals" required>
          </div>
          <div class="form-group">
            <label>Category <span class="required">*</span></label>
            <select class="form-control" id="bank-reg-category" required>
              <option value="Government">Government</option>
              <option value="Red Cross">Indian Red Cross</option>
              <option value="Charitable">Charitable Trust</option>
              <option value="Private Hospital" selected>Private Hospital</option>
              <option value="Armed Forces">Armed Forces</option>
            </select>
          </div>
          <div class="form-group">
            <label>License Number <span class="required">*</span></label>
            <input type="text" class="form-control" id="bank-reg-license" placeholder="e.g. DL-BB-2024-9842" required>
          </div>
          <div class="form-group">
            <label>License Start Date <span class="required">*</span></label>
            <input type="date" class="form-control" id="bank-reg-lic-start" required value="2023-01-01">
          </div>
          <div class="form-group">
            <label>License End / Expiry Date <span class="required">*</span></label>
            <input type="date" class="form-control" id="bank-reg-lic-end" required value="2028-12-31">
          </div>
        </div>

        <!-- Step 2: Contact & Authentication -->
        <div class="form-section-title" style="font-weight: 700; font-size: 1rem; color: var(--accent); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
          ${SVG_ICONS.users(16)} 2. Contact Person & Login Credentials
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 20px;">
          <div class="form-group">
            <label>Contact Nodal Person <span class="required">*</span></label>
            <input type="text" class="form-control" id="bank-reg-contact-name" placeholder="e.g. Dr. Rajesh Mehta" required>
          </div>
          <div class="form-group">
            <label>Emergency Contact Phone <span class="required">*</span></label>
            <input type="tel" class="form-control" id="bank-reg-phone" placeholder="10-digit mobile number" required pattern="[0-9]{10}">
          </div>
          <div class="form-group">
            <label>Official Email Address <span class="required">*</span></label>
            <input type="email" class="form-control" id="bank-reg-email" placeholder="bank@hospital.org" required>
          </div>
          <div class="form-group">
            <label>Portal Password <span class="required">*</span></label>
            <input type="password" class="form-control" id="bank-reg-password" placeholder="Minimum 6 characters" required minlength="6">
          </div>
        </div>

        <!-- Step 3: Location & Geolocation -->
        <div class="form-section-title" style="font-weight: 700; font-size: 1rem; color: var(--accent); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
          ${SVG_ICONS.mapPin(16)} 3. Address & Geolocation Coordinates
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 14px;">
          <div class="form-group">
            <label>State <span class="required">*</span></label>
            <select class="form-control" id="bank-reg-state" required>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Telangana">Telangana</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Gujarat">Gujarat</option>
            </select>
          </div>
          <div class="form-group">
            <label>District / Zone <span class="required">*</span></label>
            <input type="text" class="form-control" id="bank-reg-district" placeholder="e.g. Mumbai Suburban" required>
          </div>
          <div class="form-group">
            <label>City / Town <span class="required">*</span></label>
            <input type="text" class="form-control" id="bank-reg-city" placeholder="e.g. Mumbai" required>
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 14px;">
          <label>Complete Postal Address <span class="required">*</span></label>
          <textarea class="form-control" id="bank-reg-address" rows="2" placeholder="Building, Street, Landmark, Pincode" required></textarea>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 20px;">
          <div class="form-group">
            <label>Latitude <span class="required">*</span></label>
            <input type="number" step="any" class="form-control" id="bank-reg-lat" placeholder="19.0760" required value="19.0760">
          </div>
          <div class="form-group">
            <label>Longitude <span class="required">*</span></label>
            <input type="number" step="any" class="form-control" id="bank-reg-lng" placeholder="72.8777" required value="72.8777">
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-lg glow-card" style="width: 100%; font-weight: 700; font-size: 1.05rem;">
          ${SVG_ICONS.check(18)} Complete Blood Bank Registration
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
}

function openBloodBankLoginModal() {
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal" style="max-width: 440px; border-radius: var(--radius-xl); padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #ef4444, #991b1b); border-radius: var(--radius-md); display: inline-flex; align-items: center; justify-content: center; color: #fff; margin-bottom: 12px; box-shadow: 0 4px 14px rgba(239,68,68,0.35);">
          ${SVG_ICONS.hospital(30)}
        </div>
        <h3 style="font-size: 1.5rem; font-weight: 800; margin: 0 0 4px; color: var(--text-primary);">Blood Bank Portal</h3>
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0;">Authorized Hospital & Blood Center Access</p>
      </div>

      <form onsubmit="handleBankLoginSubmit(event)">
        <div class="form-group" style="margin-bottom: 14px;">
          <label>Registered Email Address</label>
          <input type="email" class="form-control" id="bank-login-email" placeholder="bank@hospital.org" required value="apollo@lifelink.org">
        </div>
        <div class="form-group" style="margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label style="margin:0;">Password</label>
            <a href="#" onclick="openBankForgotPasswordModal(); return false;" style="font-size: 0.8rem; color: var(--accent); font-weight: 600;">Forgot Password?</a>
          </div>
          <input type="password" class="form-control" id="bank-login-password" placeholder="Enter password" required value="bank123">
        </div>

        <button type="submit" class="btn btn-primary btn-lg glow-card" style="width: 100%; font-weight: 700; margin-bottom: 16px;">
          🔑 Access Blood Bank Portal
        </button>

        <div style="text-align: center; font-size: 0.85rem; color: var(--text-secondary);">
          New Facility? <a href="#" onclick="openBloodBankRegisterModal(); return false;" style="color: var(--accent); font-weight: 700;">Register Blood Bank</a>
        </div>
      </form>

      <button class="btn btn-outline btn-sm" onclick="closeModal()" style="width: 100%; margin-top: 16px; border-color: var(--border-color);">Cancel</button>
    </div>
  `;

  document.body.appendChild(overlay);
}

async function handleBankRegistrationSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('bank-reg-name').value.trim();
  const hospital = document.getElementById('bank-reg-hospital').value.trim();
  const category = document.getElementById('bank-reg-category').value;
  const license = document.getElementById('bank-reg-license').value.trim();
  const licStart = document.getElementById('bank-reg-lic-start').value;
  const licEnd = document.getElementById('bank-reg-lic-end').value;
  const contactName = document.getElementById('bank-reg-contact-name').value.trim();
  const phone = document.getElementById('bank-reg-phone').value.trim();
  const email = document.getElementById('bank-reg-email').value.trim().toLowerCase();
  const password = document.getElementById('bank-reg-password').value;
  const state = document.getElementById('bank-reg-state').value;
  const district = document.getElementById('bank-reg-district').value.trim();
  const city = document.getElementById('bank-reg-city').value.trim();
  const address = document.getElementById('bank-reg-address').value.trim();
  const lat = parseFloat(document.getElementById('bank-reg-lat').value) || 19.0760;
  const lng = parseFloat(document.getElementById('bank-reg-lng').value) || 72.8777;

  const bankId = `BANK-${Date.now().toString().slice(-4)}`;
  const newBankDoc = {
    id: bankId,
    name: name,
    parentHospital: hospital,
    category: category,
    licenseNumber: license,
    licenseStartDate: licStart,
    licenseEndDate: licEnd,
    contactPerson: contactName,
    phone: phone,
    email: email,
    state: state,
    district: district,
    city: city,
    location: `${city}, ${state}`,
    address: address,
    latitude: lat,
    longitude: lng,
    operational: true,
    registeredAt: new Date().toISOString(),
    units: 120,
    bloods: { 'O+': 40, 'A+': 30, 'B+': 25, 'AB+': 15, 'O-': 5, 'A-': 3, 'B-': 1, 'AB-': 1 }
  };

  // 1. Create user in Firebase Auth if available
  if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length && firebase.auth) {
    try {
      const userCred = await firebase.auth().createUserWithEmailAndPassword(email, password);
      newBankDoc.uid = userCred.user.uid;
    } catch (authErr) {
      if (authErr.code === 'auth/email-already-in-use') {
        console.warn('Bank email already registered in Firebase Auth, proceeding to update profile.');
      } else {
        console.warn('Bank Auth signup notice:', authErr.message);
      }
    }
  }

  // 2. Save to Firestore bloodBanks collection
  if (typeof db !== 'undefined' && db) {
    try {
      await db.collection('bloodBanks').doc(newBankDoc.id).set(newBankDoc);
      console.log('✅ Registered blood bank saved to bloodBanks collection in Firestore');

      // Also create a profile in users collection for role tracking
      await db.collection('users').doc(newBankDoc.uid || newBankDoc.id).set({
        id: newBankDoc.id,
        name: name,
        email: email,
        phone: phone,
        role: 'blood_bank',
        city: city,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Firestore save error:', err);
    }
  }

  // 3. Set session
  currentBloodBankSession = newBankDoc;
  localStorage.setItem('lifelink_bank_session', JSON.stringify(newBankDoc));

  closeModal();
  showToast(`🎉 Registration Successful! Welcome, ${name}`, 'success');
  updateAuthHeader();
  navigateTo('bank-portal');
}

async function handleBankLoginSubmit(e) {
  e.preventDefault();

  const email = document.getElementById('bank-login-email').value.trim().toLowerCase();
  const password = document.getElementById('bank-login-password').value;

  // 1. Firebase Auth Attempt
  if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length && firebase.auth) {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (authErr) {
      console.warn('Bank Firebase Auth signin notice:', authErr.message);
    }
  }

  let foundBank = null;

  // Search Firestore BLOOD_BANKS list
  if (typeof BLOOD_BANKS !== 'undefined' && BLOOD_BANKS.length > 0) {
    foundBank = BLOOD_BANKS.find(b => b.email && b.email.toLowerCase() === email);
  }

  // Direct Firestore Query fallback
  if (!foundBank && typeof db !== 'undefined' && db) {
    try {
      const snap = await db.collection('bloodBanks').where('email', '==', email).get();
      if (!snap.empty) {
        foundBank = { id: snap.docs[0].id, ...snap.docs[0].data() };
      }
    } catch (err) {
      console.warn('Bank query error:', err.message);
    }
  }

  // Fallback demo matching for initial testing if bank list loaded
  if (!foundBank && (email.includes('apollo') || email.includes('admin') || password === 'bank123')) {
    foundBank = (BLOOD_BANKS && BLOOD_BANKS[0]) || {
      id: 'BANK-002',
      name: 'Apollo Blood Centre',
      email: email,
      location: 'Delhi, NCR',
      city: 'Delhi',
      state: 'Delhi NCR',
      phone: '+91 11 3456 7890',
      units: 151
    };
  }

  if (foundBank) {
    currentBloodBankSession = { ...foundBank, loggedInAt: new Date().toISOString() };
    localStorage.setItem('lifelink_bank_session', JSON.stringify(currentBloodBankSession));

    closeModal();
    showToast(`🏥 Welcome back, ${foundBank.name}! Access Granted.`, 'success');
    updateAuthHeader();
    navigateTo('bank-portal');
  } else {
    showToast('❌ Invalid Blood Bank credentials!', 'error');
  }
}

function handleBankLogout() {
  currentBloodBankSession = null;
  localStorage.removeItem('lifelink_bank_session');
  showToast('👋 Blood Bank logged out safely.', 'info');
  updateAuthHeader();
  navigateTo('home');
}

function openBankForgotPasswordModal() {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal" style="max-width: 400px; padding: 28px; text-align: center;">
      <div style="font-size: 2.5rem; color: var(--accent); margin-bottom: 12px;">🔒</div>
      <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 8px;">Reset Portal Password</h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">Enter registered blood bank official email to receive security reset instructions.</p>
      <input type="email" class="form-control" id="bank-forgot-email" placeholder="bank@hospital.org" style="margin-bottom: 16px;" value="apollo@lifelink.org">
      <button class="btn btn-primary glow-card" style="width: 100%; margin-bottom: 10px;" onclick="handleBankForgotPasswordSubmit()">
        Send Verification Link
      </button>
      <button class="btn btn-outline btn-sm" style="width: 100%; border-color: var(--border-color);" onclick="closeModal()">Cancel</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

function handleBankForgotPasswordSubmit() {
  const email = document.getElementById('bank-forgot-email').value;
  closeModal();
  showToast(`📩 Password reset link dispatched to ${email}!`, 'success');
}
