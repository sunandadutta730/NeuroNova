/* ===== LifeLink Donor Management Module ===== */

async function handleRegister(e) {
  e.preventDefault();

  if (!isUserAuthenticated()) {
    requireUserAuth(() => handleRegister(e), 'submit your donor registration');
    return;
  }

  const name = document.getElementById('reg-name').value.trim();
  const blood = document.getElementById('reg-blood').value;
  const city = document.getElementById('reg-city').value;
  const phone = document.getElementById('reg-phone').value.trim();
  const age = parseInt(document.getElementById('reg-age').value) || 0;
  const lastDonation = document.getElementById('reg-last-donation').value;

  if (!validateTwoPartName(name)) {
    showToast('⚠️ Please enter both your first name and last name (e.g. Rahul Sharma).', 'error');
    return;
  }

  if (age < 18 || age > 60) {
    showToast('⚠️ Donor age must be between 18 and 60 years.', 'error');
    return;
  }

  if (!validate10DigitPhone(phone)) {
    showToast('⚠️ Mobile number must contain exactly 10 digits.', 'error');
    return;
  }

  if (lastDonation) {
    const lastDate = new Date(lastDonation);
    const today = new Date();
    const minDate = new Date('1990-01-01');
    if (lastDate > today || lastDate < minDate) {
      showToast('⚠️ Please enter a valid last donation date (between 1990 and today).', 'error');
      return;
    }
  }

  if (typeof isDuplicateDonorRecord === 'function' && isDuplicateDonorRecord(registeredDonors, null, phone)) {
    showToast('⚠️ This mobile number is already registered as a donor!', 'error');
    return;
  }

  const NOW = new Date().toISOString();
  const newDonor = {
    id: `DNR-${Date.now().toString().slice(-6)}`,
    name,
    blood,
    city,
    phone,
    age,
    available: true,
    lastDonation: lastDonation || NOW.split('T')[0],
    donations: 1,
    registeredAt: NOW
  };

  // Sync strictly to donors and users collection in Firestore
  if (typeof db !== 'undefined' && db) {
    try {
      const userId = currentUserAccount ? (currentUserAccount.uid || currentUserAccount.id) : null;
      const donorDocId = userId || newDonor.id;

      await db.collection('donors').doc(donorDocId).set({
        ...newDonor,
        uid: userId || ''
      }, { merge: true });
      console.log('✅ Donor saved to donors collection:', donorDocId);

      if (userId) {
        // Update existing user profile role to donor, instead of creating a duplicate document
        await db.collection('users').doc(userId).update({
          phone: phone,
          blood: blood,
          city: city,
<<<<<<< HEAD
=======
          age: age,
>>>>>>> f7eadcb (feat: implement core authentication system and secure Firestore rules with owner-based access control)
          role: 'donor'
        });
        console.log('✅ Updated existing user account to donor role:', userId);
      }
    } catch (err) {
      console.error('❌ Firestore donors write error:', err);
    }
  }

  showRegistrationSuccessModal(newDonor);
}

function showRegistrationSuccessModal(donor) {
  const bodyHtml = `
    <div style="text-align: center; padding: 12px 0;">
      <div style="width: 64px; height: 64px; background: #ecfdf5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #10b981;">
        ${SVG_ICONS.check(36, '#10b981')}
      </div>
      <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--gray-900); margin-bottom: 8px;">Registration Successful! 🎉</h3>
      <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px;">
        Thank you, <strong>${donor.name}</strong>! You are now registered as an available <strong>${donor.blood}</strong> blood donor in <strong>${donor.city}</strong>.
      </p>
      <div style="background: var(--gray-50); border-radius: var(--radius-md); padding: 16px; text-align: left; font-size: 0.88rem; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-secondary);">Blood Group:</span>
          <span class="blood-badge">${donor.blood}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-secondary);">City:</span>
          <strong>${donor.city}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-secondary);">Phone:</span>
          <strong>${donor.phone}</strong>
        </div>
      </div>
    </div>
  `;

  showModal('LifeLink Network', bodyHtml, [
    { text: 'View All Donors', class: 'btn-primary', action: () => { closeModal(); navigateTo('find'); } },
    { text: 'Close', class: 'btn-outline', action: () => closeModal() }
  ]);
}

function checkDonationEligibility() {
  const dateVal = document.getElementById('reg-last-donation').value;
  const warn = document.getElementById('donation-warning');
  if (!warn) return;

  if (!dateVal) {
    warn.style.display = 'none';
    return;
  }

  const lastDate = new Date(dateVal);
  const now = new Date();
  const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

  if (diffDays < 90) {
    const remaining = 90 - diffDays;
    warn.className = 'donation-warning';
    warn.style.display = 'flex';
    warn.innerHTML = `⚠️ <strong>Note:</strong> Standard donation frequency is 3 months (90 days). You have ~${remaining} days remaining, but you can still register!`;
  } else {
    warn.className = 'donation-warning ok';
    warn.style.display = 'flex';
    warn.innerHTML = `✅ <strong>Eligible!</strong> It has been more than 90 days since your last donation.`;
  }
}

function renderRegister() {
  const donorCount = registeredDonors.filter(d => d.available).length;
  return `
    <div class="page-header">
      <div class="container">
        <h1>Become a Blood Donor</h1>
        <p>Register in 60 seconds. Your single donation can save up to 3 lives in critical emergencies.</p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="form-card animate-on-scroll">
          <h2>Donor Registration</h2>
          <p class="subtitle">Enter your details to join the LifeLink active donor database and help save lives in your city.</p>

          <div class="reg-info-strip">
            <div class="reg-info-item">
              <div class="reg-info-icon red">${SVG_ICONS.users(18, 'var(--red-600)')}</div>
              <div class="reg-info-text">
                <div class="label">Active Donors</div>
                <div class="value">${donorCount} Available</div>
              </div>
            </div>
            <div class="reg-info-item">
              <div class="reg-info-icon green">${SVG_ICONS.check(18, '#10b981')}</div>
              <div class="reg-info-text">
                <div class="label">Donation Interval</div>
                <div class="value">Every 90 Days</div>
              </div>
            </div>
            <div class="reg-info-item">
              <div class="reg-info-icon blue">${SVG_ICONS.shield(18, 'var(--blue-500)')}</div>
              <div class="reg-info-text">
                <div class="label">Privacy</div>
                <div class="value">100% Secure</div>
              </div>
            </div>
          </div>

          <form id="donor-form" onsubmit="handleRegister(event)">
            <div class="form-grid">
              <div class="form-group">
                <label>Full Name <span class="required">*</span></label>
                <input type="text" class="form-control" id="reg-name" placeholder="e.g. Rahul Sharma" required autocomplete="name">
              </div>

              <div class="form-group">
                <label>Blood Group <span class="required">*</span></label>
                <select class="form-control" id="reg-blood" required>
                  <option value="">Select Blood Group</option>
                  ${BLOOD_GROUPS.map(g => `<option value="${g}">${g}${RARE_GROUPS.includes(g) ? ' (Rare)' : ''}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label>City <span class="required">*</span></label>
                <select class="form-control" id="reg-city" required>
                  <option value="">Select City</option>
                  ${CITIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label>Phone Number <span class="required">*</span></label>
                <input type="tel" class="form-control" id="reg-phone" placeholder="10-digit mobile number" required maxlength="10" minlength="10" pattern="[0-9]{10}" autocomplete="tel">
              </div>

              <div class="form-group">
                <label>Age (Years) <span class="required">*</span></label>
                <input type="number" class="form-control" id="reg-age" placeholder="Age (18 - 60)" required min="18" max="60">
              </div>

              <div class="form-group full-width">
                <label>Last Donation Date <span style="font-weight:400; color:var(--text-secondary);">(Optional)</span></label>
                <input type="date" class="form-control" id="reg-last-donation" onchange="checkDonationEligibility()" max="${new Date().toISOString().split('T')[0]}">
                <div id="donation-warning" style="display:none;"></div>
              </div>
            </div>

            <div class="form-submit-area">
              <button type="submit" class="btn btn-primary btn-lg glow-card">
                ${SVG_ICONS.heart(20)} Register as Active Donor
              </button>
              <p class="form-submit-note">
                ${SVG_ICONS.shield(14, 'var(--gray-400)')}
                Your information is saved securely and shared only with emergency contacts.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  `;
}

function renderFind() {
  return `
    <div class="page-header">
      <div class="container">
        <h1>Find Blood Donors</h1>
        <p>Search verified, active blood donors in your city. Filter by blood group for instant contact.</p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="search-bar animate-on-scroll">
          <select class="form-control" id="filter-blood" onchange="filterDonors()">
            <option value="">All Blood Groups</option>
            ${BLOOD_GROUPS.map(g => `<option value="${g}">${g}</option>`).join('')}
          </select>

          <select class="form-control" id="filter-city" onchange="filterDonors()">
            <option value="">All Cities</option>
            ${CITIES.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>

          <select class="form-control" id="filter-status" onchange="filterDonors()">
            <option value="">All Statuses</option>
            <option value="available" selected>Available Only</option>
            <option value="unavailable">Unavailable</option>
          </select>

          <button class="btn btn-primary" onclick="filterDonors()">
            ${SVG_ICONS.search(18)} Search Donors
          </button>
        </div>

        <div id="donor-results-container" class="donor-results"></div>
      </div>
    </section>
  `;
}

function filterDonors() {
  const bloodEl = document.getElementById('filter-blood');
  const cityEl = document.getElementById('filter-city');
  const statusEl = document.getElementById('filter-status');
  const container = document.getElementById('donor-results-container');
  if (!container) return;

  const blood = bloodEl ? bloodEl.value : '';
  const city = cityEl ? cityEl.value : '';
  const status = statusEl ? statusEl.value : 'available';

  const filtered = registeredDonors.filter(d => {
    if (blood && d.blood !== blood) return false;
    if (city && d.city !== city) return false;
    if (status === 'available' && !d.available) return false;
    if (status === 'unavailable' && d.available) return false;
    return true;
  });

  renderDonorCards(filtered, container);
}

function renderDonorCards(donors, container) {
  if (donors.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 2px dashed var(--border-color);">
        <div style="font-size: 3rem; margin-bottom: 12px; color: var(--gray-400);">${SVG_ICONS.search(48, 'var(--gray-300)')}</div>
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;">No Donors Found</h3>
        <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto 20px;">No donors match your exact filter criteria. Try selecting a different city or blood group.</p>
        <button class="btn btn-outline" onclick="document.getElementById('filter-blood').value=''; document.getElementById('filter-city').value=''; document.getElementById('filter-status').value=''; filterDonors();">Clear Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = donors.map(d => `
    <div class="donor-card glow-card animate-on-scroll">
      <div class="donor-card-header">
        <div class="donor-avatar">${d.blood}</div>
        <div>
          <div class="donor-name">${d.name}</div>
          <span class="donor-status ${d.available ? 'available' : 'unavailable'}">
            <span class="donor-status-dot"></span>
            ${d.available ? 'Available Now' : 'Currently Unavailable'}
          </span>
        </div>
      </div>
      <div class="donor-details">
        <div class="donor-detail">
          ${SVG_ICONS.mapPin(16, 'var(--gray-400)')} ${d.city}
        </div>
        <div class="donor-detail">
          ${SVG_ICONS.phone(16, 'var(--gray-400)')} ${d.phone}
        </div>
        <div class="donor-detail">
          ${SVG_ICONS.droplet(16, 'var(--gray-400)')} ${d.donations || 0} Total Donations
        </div>
      </div>
      <a href="tel:${d.phone}" class="btn btn-primary btn-sm glow-card" style="width: 100%; font-weight: 700;" onclick="handleCallDonorClick(event, '${d.phone}', '${d.name}')">
        ${SVG_ICONS.phone(14)} Call Donor
      </a>
    </div>
  `).join('');
}

function handleCallDonorClick(e, phone, name) {
  if (!isUserAuthenticated()) {
    e.preventDefault();
    requireUserAuth(() => {
      window.location.href = `tel:${phone}`;
    }, `contact donor ${name}`);
  }
}
