<<<<<<< HEAD
/* ===== LifeLink Emergency Requests & Receiver Module ===== */

async function handleEmergencyRequest(e) {
  e.preventDefault();

  if (!isUserAuthenticated()) {
    requireUserAuth(() => handleEmergencyRequest(e), 'submit an emergency blood request');
    return;
  }

  const patient = document.getElementById('emg-patient').value.trim();
  const blood = document.getElementById('emg-blood').value;
  const hospital = document.getElementById('emg-hospital').value.trim();
  const city = document.getElementById('emg-city').value;
  const phone = document.getElementById('emg-phone').value.trim();
  const units = parseInt(document.getElementById('emg-units').value) || 1;

  if (!validateTwoPartName(patient)) {
    showToast('⚠️ Please enter both the patient\'s first name and last name (e.g. Amit Kumar).', 'error');
    return;
  }

  if (!validate10DigitPhone(phone)) {
    showToast('⚠️ Contact phone number must contain exactly 10 digits.', 'error');
    return;
  }

  const selectedUrgencyBtn = document.querySelector('.urgency-option.selected');
  const urgency = selectedUrgencyBtn ? selectedUrgencyBtn.dataset.urgency : 'critical';

  const reqId = `REQ-${Date.now().toString().slice(-4)}`;
  const NOW = new Date().toISOString();
  const newReq = {
    id: reqId,
    patient,
    patientName: patient,
    blood,
    bloodGroup: blood,
    hospital,
    hospitalName: hospital,
    city,
    phone,
    contactPhone: phone,
    units,
    urgency,
    status: 'PENDING',
    acceptedBy: null,
    dispatchStatus: 'NOT_DISPATCHED',
    patientConfirmed: false,
    bankConfirmed: false,
    progressTimeline: [
      { step: 'Request Submitted', time: NOW },
      { step: 'Broadcast Sent to Registered Blood Banks', time: NOW }
    ],
    createdAt: NOW
  };

  // Sync strictly to bloodRequests table in Firestore
  if (typeof db !== 'undefined' && db) {
    try {
      await db.collection('bloodRequests').doc(reqId).set(newReq);
      console.log('✅ Emergency request saved to bloodRequests collection:', reqId);

      // Send Broadcast notification to notifications collection
      await db.collection('notifications').add({
        targetRole: 'bank',
        title: `🚨 Emergency Request: ${blood} (${units} Units)`,
        message: `Urgent request for patient ${patient} at ${hospital}, ${city}. Phone: ${phone}`,
        type: 'EMERGENCY',
        timestamp: NOW,
        read: false,
        requestId: reqId
      });
    } catch (err) {
      console.error('❌ bloodRequests table error:', err);
    }
  }

  showToast('🚨 Emergency request broadcasted across all Blood Banks!', 'success');
  navigateTo('emergency');
}

async function confirmPatientReceipt(reqId) {
  const req = emergencyRequestsList.find(r => r.id === reqId);
  if (!req) return;

  const NOW = new Date().toISOString();
  req.patientConfirmed = true;
  req.progressTimeline = req.progressTimeline || [];
  req.progressTimeline.push({ step: 'Patient / Hospital Confirmed Receipt', time: NOW });

  if (req.bankConfirmed || req.bloodBankDelivered) {
    req.status = 'COMPLETED';
    req.completedAt = NOW;
    req.deliveryStatus = 'FULLY_DELIVERED';
    req.progressTimeline.push({ step: 'Double Confirmed & Completed', time: NOW });
    showToast(`🎉 Request #${reqId} FULLY COMPLETED via Double Confirmation!`, 'success');
  } else {
    req.status = 'AWAITING_FINAL_CONFIRMATION';
    showToast(`✔️ Patient confirmed receipt! Awaiting Blood Bank delivery confirmation.`, 'info');
  }

  if (typeof db !== 'undefined' && db) {
    try {
      await db.collection('bloodRequests').doc(reqId).update(req);
    } catch (err) {
      console.error('Update error:', err);
    }
  }

  renderPage();
}



function getUrgencyClass(urgency) {
  if (urgency === 'critical') return 'badge-red';
  if (urgency === 'urgent') return 'badge-amber';
  return 'badge-green';
}

function renderEmergency() {
  return `
    <div class="page-header" style="background: linear-gradient(180deg, #fef2f2 0%, #fff 100%);">
      <div class="container">
        <h1 style="color: var(--red-700);">${SVG_ICONS.siren(32, 'var(--red-600)')} Emergency Blood Dispatch</h1>
        <p>Broadcast urgent blood requests directly to nearby active donors and regional blood banks.</p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="dashboard-grid">
          <!-- Request Form -->
          <div class="form-card animate-on-scroll" style="margin: 0;">
            <h2 style="font-size: 1.5rem; margin-bottom: 4px;">Submit Emergency Request</h2>
            <p class="subtitle" style="margin-bottom: 24px;">Fill out patient details for instant network dispatch.</p>

            <form id="emergency-form" onsubmit="handleEmergencyRequest(event)">
              <div class="form-grid">
                <div class="form-group">
                  <label>Patient Name <span class="required">*</span></label>
                  <input type="text" class="form-control" id="emg-patient" placeholder="Patient's Full Name" required>
                </div>

                <div class="form-group">
                  <label>Required Blood Group <span class="required">*</span></label>
                  <select class="form-control" id="emg-blood" required>
                    <option value="">Select Blood Group</option>
                    ${BLOOD_GROUPS.map(g => `<option value="${g}">${g}</option>`).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label>Hospital / Clinic <span class="required">*</span></label>
                  <input type="text" class="form-control" id="emg-hospital" placeholder="e.g. Lilavati Hospital" required>
                </div>

                <div class="form-group">
                  <label>City <span class="required">*</span></label>
                  <select class="form-control" id="emg-city" required>
                    <option value="">Select City</option>
                    ${CITIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label>Contact Phone <span class="required">*</span></label>
                  <input type="tel" class="form-control" id="emg-phone" placeholder="10-digit mobile number" required maxlength="10" minlength="10" pattern="[0-9]{10}">
                </div>

                <div class="form-group">
                  <label>Blood Units Needed <span class="required">*</span></label>
                  <input type="number" class="form-control" id="emg-units" min="1" max="10" value="2" required>
                </div>

                <div class="form-group full-width">
                  <label>Urgency Level <span class="required">*</span></label>
                  <div class="urgency-selector">
                    <div class="urgency-option normal" data-urgency="normal" onclick="document.querySelectorAll('.urgency-option').forEach(o => o.classList.remove('selected')); this.classList.add('selected');">
                      Standard (24h)
                    </div>
                    <div class="urgency-option urgent" data-urgency="urgent" onclick="document.querySelectorAll('.urgency-option').forEach(o => o.classList.remove('selected')); this.classList.add('selected');">
                      Urgent (6h)
                    </div>
                    <div class="urgency-option critical selected" data-urgency="critical" onclick="document.querySelectorAll('.urgency-option').forEach(o => o.classList.remove('selected')); this.classList.add('selected');">
                      🚨 Critical (Immediate)
                    </div>
                  </div>
                </div>
              </div>

              <div style="margin-top: 28px;">
                <button type="submit" class="btn btn-primary btn-lg pulse-beacon" style="width: 100%; background: linear-gradient(135deg, var(--red-600), var(--red-800)); font-weight: 800;">
                  ${SVG_ICONS.siren(22)} Broadcast Emergency Request Now
                </button>
              </div>
            </form>
          </div>

          <!-- Active Requests Sidebar -->
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
              ${SVG_ICONS.activity(20, 'var(--red-600)')} Live Emergency Feed
            </h3>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${emergencyRequestsList.map(r => `
                <div class="card glow-card" style="padding: 18px; border-left: 4px solid ${r.urgency === 'critical' ? 'var(--critical)' : 'var(--warning)'};">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                      <span class="badge badge-blue" style="font-size: 0.75rem;">${r.id}</span>
                      <strong style="font-size: 1.05rem; display: block; margin-top: 2px;">${r.patient || r.patientName}</strong>
                      <span style="font-size: 0.82rem; color: var(--text-secondary);">${r.hospital || r.hospitalName}, ${r.city}</span>
                    </div>
                    <span class="blood-badge" style="font-size: 1rem;">${r.blood || r.bloodGroup}</span>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0; font-size: 0.82rem;">
                    <span>Needed: <strong>${r.units} Units</strong></span>
                    <span class="badge ${r.status === 'COMPLETED' ? 'badge-green' : (r.status === 'ACCEPTED' ? 'badge-blue' : 'badge-amber')}">${r.status || 'PENDING'}</span>
                  </div>

                  ${r.acceptedBy ? `
                    <div style="font-size: 0.78rem; background: var(--bg-muted); padding: 6px 8px; border-radius: var(--radius-sm); margin-bottom: 8px;">
                      🏥 Accepted by: <strong>${r.acceptedBy.bankName}</strong>
                    </div>
                  ` : ''}

                  ${r.status !== 'COMPLETED' ? `
                    <button class="btn btn-outline btn-sm" style="width: 100%; font-weight: 700; border-color: #10b981; color: #10b981;" onclick="confirmPatientReceipt('${r.id}')">
                      ✔️ Patient / Hospital Confirm Delivery
                    </button>
                  ` : `
                    <div class="badge badge-green" style="width: 100%; text-align: center; padding: 6px;">
                      ✅ DOUBLE CONFIRMED & CLOSED
                    </div>
                  `}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
=======
/* ===== LifeLink Emergency Requests & Receiver Module ===== */

async function handleEmergencyRequest(e) {
  e.preventDefault();

  if (!isUserAuthenticated()) {
    requireUserAuth(() => handleEmergencyRequest(e), 'submit an emergency blood request');
    return;
  }

  const patient = document.getElementById('emg-patient').value.trim();
  const blood = document.getElementById('emg-blood').value;
  const hospital = document.getElementById('emg-hospital').value.trim();
  const city = document.getElementById('emg-city').value;
  const phone = document.getElementById('emg-phone').value.trim();
  const units = parseInt(document.getElementById('emg-units').value) || 1;

  if (!validateTwoPartName(patient)) {
    showToast('⚠️ Please enter both the patient\'s first name and last name (e.g. Amit Kumar).', 'error');
    return;
  }

  if (!validate10DigitPhone(phone)) {
    showToast('⚠️ Contact phone number must contain exactly 10 digits.', 'error');
    return;
  }

  const selectedUrgencyBtn = document.querySelector('.urgency-option.selected');
  const urgency = selectedUrgencyBtn ? selectedUrgencyBtn.dataset.urgency : 'critical';

  const reqId = `REQ-${Date.now().toString().slice(-4)}`;
  const NOW = new Date().toISOString();
  const newReq = {
    id: reqId,
    patient,
    patientName: patient,
    blood,
    bloodGroup: blood,
    hospital,
    hospitalName: hospital,
    city,
    phone,
    contactPhone: phone,
    units,
    urgency,
    status: 'PENDING',
    acceptedBy: null,
    dispatchStatus: 'NOT_DISPATCHED',
    patientConfirmed: false,
    bankConfirmed: false,
    progressTimeline: [
      { step: 'Request Submitted', time: NOW },
      { step: 'Broadcast Sent to Registered Blood Banks', time: NOW }
    ],
    createdAt: NOW
  };

  // Sync strictly to bloodRequests table in Firestore
  if (typeof db !== 'undefined' && db) {
    try {
      await db.collection('bloodRequests').doc(reqId).set(newReq);
      console.log('✅ Emergency request saved to bloodRequests collection:', reqId);

      // Send Broadcast notification to notifications collection
      await db.collection('notifications').add({
        targetRole: 'bank',
        title: `🚨 Emergency Request: ${blood} (${units} Units)`,
        message: `Urgent request for patient ${patient} at ${hospital}, ${city}. Phone: ${phone}`,
        type: 'EMERGENCY',
        timestamp: NOW,
        read: false,
        requestId: reqId
      });
    } catch (err) {
      console.error('❌ bloodRequests table error:', err);
    }
  }

  showToast('🚨 Emergency request broadcasted across all Blood Banks!', 'success');
  navigateTo('emergency');
}

async function confirmPatientReceipt(reqId) {
  const req = emergencyRequestsList.find(r => r.id === reqId);
  if (!req) return;

  const NOW = new Date().toISOString();
  req.patientConfirmed = true;
  req.progressTimeline = req.progressTimeline || [];
  req.progressTimeline.push({ step: 'Patient / Hospital Confirmed Receipt', time: NOW });

  if (req.bankConfirmed || req.bloodBankDelivered) {
    req.status = 'COMPLETED';
    req.completedAt = NOW;
    req.deliveryStatus = 'FULLY_DELIVERED';
    req.progressTimeline.push({ step: 'Double Confirmed & Completed', time: NOW });
    showToast(`🎉 Request #${reqId} FULLY COMPLETED via Double Confirmation!`, 'success');
  } else {
    req.status = 'AWAITING_FINAL_CONFIRMATION';
    showToast(`✔️ Patient confirmed receipt! Awaiting Blood Bank delivery confirmation.`, 'info');
  }

  if (typeof db !== 'undefined' && db) {
    try {
      await db.collection('bloodRequests').doc(reqId).update(req);
    } catch (err) {
      console.error('Update error:', err);
    }
  }

  renderPage();
}



function getUrgencyClass(urgency) {
  if (urgency === 'critical') return 'badge-red';
  if (urgency === 'urgent') return 'badge-amber';
  return 'badge-green';
}

function renderEmergency() {
  return `
    <div class="page-header" style="background: linear-gradient(180deg, #fef2f2 0%, #fff 100%);">
      <div class="container">
        <h1 style="color: var(--red-700);">${SVG_ICONS.siren(32, 'var(--red-600)')} Emergency Blood Dispatch</h1>
        <p>Broadcast urgent blood requests directly to nearby active donors and regional blood banks.</p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="dashboard-grid">
          <!-- Request Form -->
          <div class="form-card animate-on-scroll" style="margin: 0;">
            <h2 style="font-size: 1.5rem; margin-bottom: 4px;">Submit Emergency Request</h2>
            <p class="subtitle" style="margin-bottom: 24px;">Fill out patient details for instant network dispatch.</p>

            <form id="emergency-form" onsubmit="handleEmergencyRequest(event)">
              <div class="form-grid">
                <div class="form-group">
                  <label>Patient Name <span class="required">*</span></label>
                  <input type="text" class="form-control" id="emg-patient" placeholder="Patient's Full Name" required>
                </div>

                <div class="form-group">
                  <label>Required Blood Group <span class="required">*</span></label>
                  <select class="form-control" id="emg-blood" required>
                    <option value="">Select Blood Group</option>
                    ${BLOOD_GROUPS.map(g => `<option value="${g}">${g}</option>`).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label>Hospital / Clinic <span class="required">*</span></label>
                  <input type="text" class="form-control" id="emg-hospital" placeholder="e.g. Lilavati Hospital" required>
                </div>

                <div class="form-group">
                  <label>City <span class="required">*</span></label>
                  <select class="form-control" id="emg-city" required>
                    <option value="">Select City</option>
                    ${CITIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label>Contact Phone <span class="required">*</span></label>
                  <input type="tel" class="form-control" id="emg-phone" placeholder="10-digit mobile number" required maxlength="10" minlength="10" pattern="[0-9]{10}">
                </div>

                <div class="form-group">
                  <label>Blood Units Needed <span class="required">*</span></label>
                  <input type="number" class="form-control" id="emg-units" min="1" max="10" value="2" required>
                </div>

                <div class="form-group full-width">
                  <label>Urgency Level <span class="required">*</span></label>
                  <div class="urgency-selector">
                    <div class="urgency-option normal" data-urgency="normal" onclick="document.querySelectorAll('.urgency-option').forEach(o => o.classList.remove('selected')); this.classList.add('selected');">
                      Standard (24h)
                    </div>
                    <div class="urgency-option urgent" data-urgency="urgent" onclick="document.querySelectorAll('.urgency-option').forEach(o => o.classList.remove('selected')); this.classList.add('selected');">
                      Urgent (6h)
                    </div>
                    <div class="urgency-option critical selected" data-urgency="critical" onclick="document.querySelectorAll('.urgency-option').forEach(o => o.classList.remove('selected')); this.classList.add('selected');">
                      🚨 Critical (Immediate)
                    </div>
                  </div>
                </div>
              </div>

              <div style="margin-top: 28px;">
                <button type="submit" class="btn btn-primary btn-lg pulse-beacon" style="width: 100%; background: linear-gradient(135deg, var(--red-600), var(--red-800)); font-weight: 800;">
                  ${SVG_ICONS.siren(22)} Broadcast Emergency Request Now
                </button>
              </div>
            </form>
          </div>

          <!-- Active Requests Sidebar -->
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
              ${SVG_ICONS.activity(20, 'var(--red-600)')} Live Emergency Feed
            </h3>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${emergencyRequestsList.map(r => `
                <div class="card glow-card" style="padding: 18px; border-left: 4px solid ${r.urgency === 'critical' ? 'var(--critical)' : 'var(--warning)'};">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                      <span class="badge badge-blue" style="font-size: 0.75rem;">${r.id}</span>
                      <strong style="font-size: 1.05rem; display: block; margin-top: 2px;">${r.patient || r.patientName}</strong>
                      <span style="font-size: 0.82rem; color: var(--text-secondary);">${r.hospital || r.hospitalName}, ${r.city}</span>
                    </div>
                    <span class="blood-badge" style="font-size: 1rem;">${r.blood || r.bloodGroup}</span>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0; font-size: 0.82rem;">
                    <span>Needed: <strong>${r.units} Units</strong></span>
                    <span class="badge ${r.status === 'COMPLETED' ? 'badge-green' : (r.status === 'ACCEPTED' ? 'badge-blue' : 'badge-amber')}">${r.status || 'PENDING'}</span>
                  </div>

                  ${r.acceptedBy ? `
                    <div style="font-size: 0.78rem; background: var(--bg-muted); padding: 6px 8px; border-radius: var(--radius-sm); margin-bottom: 8px;">
                      🏥 Accepted by: <strong>${r.acceptedBy.bankName}</strong>
                    </div>
                  ` : ''}

                  ${r.status !== 'COMPLETED' ? `
                    <button class="btn btn-outline btn-sm" style="width: 100%; font-weight: 700; border-color: #10b981; color: #10b981;" onclick="confirmPatientReceipt('${r.id}')">
                      ✔️ Patient / Hospital Confirm Delivery
                    </button>
                  ` : `
                    <div class="badge badge-green" style="width: 100%; text-align: center; padding: 6px;">
                      ✅ DOUBLE CONFIRMED & CLOSED
                    </div>
                  `}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
>>>>>>> 50df74493a51fee645ee5a375bef7dba1f931b18
