/* ===== LifeLink Admin Control Center Module ===== */

let activeAdminTab = 'donors';

function renderAdmin() {
  if (!isAdminLoggedIn) {
    return `
      <section class="section" style="padding-top: calc(var(--header-height) + 60px); text-align: center;">
        <div class="container" style="max-width: 500px;">
          <div class="card glow-card" style="padding: 40px 24px;">
            <div style="font-size: 3rem; color: var(--accent); margin-bottom: 16px;">${SVG_ICONS.shield(48, 'var(--accent)')}</div>
            <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 12px;">Admin Access Required</h2>
            <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 0.95rem;">You must log in as an administrator to access the LifeLink Control Center.</p>
            <button class="btn btn-primary btn-lg glow-card" style="width: 100%;" onclick="openAuthModal('login', 'admin')">
              ${SVG_ICONS.shield(18)} Sign In as Administrator
            </button>
          </div>
        </div>
      </section>
    `;
  }

  const activeDonorsCount = registeredDonors.filter(d => d.available).length;
  const pendingReqCount = emergencyRequestsList.filter(r => r.status === 'PENDING' || r.status === 'Pending').length;
  const completedReqCount = emergencyRequestsList.filter(r => r.status === 'COMPLETED').length;
  const pendingDeliveriesCount = emergencyRequestsList.filter(r => r.dispatchStatus === 'DISPATCHED' && r.status !== 'COMPLETED').length;
  const totalStockUnits = BLOOD_BANKS.reduce((acc, b) => acc + (b.units || 0), 0);
  const totalNgos = (typeof ngoPartnersList !== 'undefined' ? ngoPartnersList.length : 0);
  const totalContractDonors = (typeof contractDonorsList !== 'undefined' ? contractDonorsList.length : 0);
  const totalCamps = (typeof bloodCollectionCampsList !== 'undefined' ? bloodCollectionCampsList.length : 0);

  return `
    <div class="page-header" style="background: linear-gradient(180deg, #1f2937 0%, #111827 100%); color: #fff;">
      <div class="container">
        <h1 style="color: #fff;">${SVG_ICONS.shield(32, '#ef4444')} Admin Control Center</h1>
        <p style="color: #9ca3af;">Manage donor registries, emergency requests, stock inventories, and network alerts.</p>
      </div>
    </div>

    <section class="section" style="padding-top: 36px;">
      <div class="container">
        <!-- Summary Cards Grid -->
        <div class="admin-summary-grid animate-on-scroll" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
          <div class="admin-stat-card">
            <div class="admin-stat-icon red">${SVG_ICONS.users(24)}</div>
            <div>
              <div class="admin-stat-val">${registeredDonors.length}</div>
              <div class="admin-stat-label">Total Donors (${activeDonorsCount} Active)</div>
            </div>
          </div>

          <div class="admin-stat-card">
            <div class="admin-stat-icon amber">${SVG_ICONS.siren(24)}</div>
            <div>
              <div class="admin-stat-val">${emergencyRequestsList.length}</div>
              <div class="admin-stat-label">Requests (${pendingReqCount} Pending / ${completedReqCount} Done)</div>
            </div>
          </div>

          <div class="admin-stat-card">
            <div class="admin-stat-icon blue">${SVG_ICONS.hospital(24)}</div>
            <div>
              <div class="admin-stat-val">${totalStockUnits}</div>
              <div class="admin-stat-label">Units in ${BLOOD_BANKS.length} Blood Banks</div>
            </div>
          </div>

          <div class="admin-stat-card">
            <div class="admin-stat-icon green">${SVG_ICONS.check(24)}</div>
            <div>
              <div class="admin-stat-val">${completedReqCount}</div>
              <div class="admin-stat-label">Completed Deliveries (${pendingDeliveriesCount} In Transit)</div>
            </div>
          </div>

          <div class="admin-stat-card">
            <div class="admin-stat-icon purple">🤝</div>
            <div>
              <div class="admin-stat-val">${totalNgos}</div>
              <div class="admin-stat-label">Registered NGO Partners</div>
            </div>
          </div>

          <div class="admin-stat-card">
            <div class="admin-stat-icon red">🩸</div>
            <div>
              <div class="admin-stat-val">${totalContractDonors}</div>
              <div class="admin-stat-label">Contract Donors</div>
            </div>
          </div>

          <div class="admin-stat-card">
            <div class="admin-stat-icon amber">🎪</div>
            <div>
              <div class="admin-stat-val">${totalCamps}</div>
              <div class="admin-stat-label">Collection Camps</div>
            </div>
          </div>
        </div>

        <!-- Admin Tabs Header -->
        <div class="admin-header-actions animate-on-scroll">
          <div class="admin-tabs">
            <button class="admin-tab ${activeAdminTab === 'donors' ? 'active' : ''}" onclick="switchAdminTab('donors')">Registered Donors (${registeredDonors.length})</button>
            <button class="admin-tab ${activeAdminTab === 'requests' ? 'active' : ''}" onclick="switchAdminTab('requests')">Emergency Feed (${emergencyRequestsList.length})</button>
            <button class="admin-tab ${activeAdminTab === 'banks' ? 'active' : ''}" onclick="switchAdminTab('banks')">Blood Banks Stock (${BLOOD_BANKS.length})</button>
            <button class="admin-tab ${activeAdminTab === 'alerts' ? 'active' : ''}" onclick="switchAdminTab('alerts')">Broadcast Alert</button>
          </div>
        </div>

        <!-- Tab Body -->
        <div id="admin-tab-content">
          ${renderAdminTabBody()}
        </div>
      </div>
    </section>
  `;
}

function switchAdminTab(tabName) {
  activeAdminTab = tabName;
  renderPage();
}

function renderAdminTabBody() {
  if (activeAdminTab === 'donors') {
    return `
      <div class="admin-table-wrapper animate-on-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Donor Name</th>
              <th>Blood</th>
              <th>City</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${registeredDonors.map((d, index) => `
              <tr>
                <td><strong>${d.name}</strong></td>
                <td><span class="blood-badge">${d.blood}</span></td>
                <td>${d.city}</td>
                <td>${d.phone}</td>
                <td>
                  <span class="status-badge ${d.available ? 'available' : 'unavailable'}">
                    ${d.available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td>
                  <button class="admin-action-btn toggle-btn" onclick="adminToggleDonorStatus(${index})">
                    Toggle Availability
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (activeAdminTab === 'requests') {
    return `
      <div class="admin-table-wrapper animate-on-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Req ID</th>
              <th>Patient</th>
              <th>Blood</th>
              <th>Hospital & City</th>
              <th>Units</th>
              <th>Status</th>
              <th>Accepted Bank</th>
              <th>Confirmations</th>
              <th>Timeline & Actions</th>
            </tr>
          </thead>
          <tbody>
            ${emergencyRequestsList.map((r, index) => `
              <tr>
                <td><code>${r.id}</code></td>
                <td><strong>${r.patient || r.patientName}</strong></td>
                <td><span class="blood-badge">${r.blood || r.bloodGroup}</span></td>
                <td>${r.hospital || r.hospitalName}, ${r.city}</td>
                <td>${r.units}u</td>
                <td><span class="badge ${r.status === 'COMPLETED' ? 'badge-green' : (r.status === 'ACCEPTED' ? 'badge-blue' : 'badge-amber')}">${r.status || 'PENDING'}</span></td>
                <td>${r.acceptedBy ? `<strong>${r.acceptedBy.bankName}</strong>` : '<span style="color:var(--text-muted);">Unassigned</span>'}</td>
                <td>
                  <div style="font-size: 0.78rem;">
                    Patient: <span class="badge ${r.patientConfirmed ? 'badge-green' : 'badge-amber'}">${r.patientConfirmed ? 'YES' : 'NO'}</span><br>
                    Bank: <span class="badge ${r.bankConfirmed ? 'badge-green' : 'badge-amber'}">${r.bankConfirmed ? 'YES' : 'NO'}</span>
                  </div>
                </td>
                <td>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button class="admin-action-btn" onclick="openAdminTimelineModal('${r.id}')">Timeline</button>
                    <button class="admin-action-btn danger" onclick="adminDeleteRequest('${r.id}')">${SVG_ICONS.trash(12)}</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (activeAdminTab === 'banks') {
    return `
      <div class="admin-table-wrapper animate-on-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Blood Bank Name</th>
              <th>Location</th>
              <th>Available Units</th>
              <th>Stock Status</th>
              <th>Quick Stock Adjustment</th>
            </tr>
          </thead>
          <tbody>
            ${BLOOD_BANKS.map((b, index) => `
              <tr>
                <td><strong>${b.name}</strong></td>
                <td>${b.location || b.city}</td>
                <td><strong>${b.units || 0} Units</strong></td>
                <td><span class="badge ${(b.units || 0) > 100 ? 'badge-green' : 'badge-amber'}">${(b.units || 0) > 100 ? 'Adequate' : 'Running Low'}</span></td>
                <td>
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <button class="admin-action-btn" onclick="adminUpdateStock('${b.id}', 10)">+10 Units</button>
                    <button class="admin-action-btn danger" onclick="adminUpdateStock('${b.id}', -10)">-10 Units</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (activeAdminTab === 'alerts') {
    return `
      <div class="form-card animate-on-scroll" style="max-width: 600px; margin: 0;">
        <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 8px;">Broadcast Network Alert</h3>
        <p class="subtitle" style="margin-bottom: 20px;">Publish shortage warnings to all user dashboards.</p>
        <form onsubmit="publishAlert(event)">
          <div class="form-group" style="margin-bottom: 16px;">
            <label>Alert Severity Level</label>
            <select class="form-control" id="alert-type" required>
              <option value="critical">Critical Red Shortage</option>
              <option value="warning">Amber Low Stock Warning</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 20px;">
            <label>Alert Announcement Message</label>
            <input type="text" class="form-control" id="alert-text" placeholder="e.g. Critical O- blood shortage in Mumbai hospitals" required>
          </div>
          <button type="submit" class="btn btn-primary glow-card" style="width: 100%;">
            ${SVG_ICONS.siren(18)} Publish Network Broadcast
          </button>
        </form>
      </div>
    `;
  }

  return '';
}

async function adminToggleDonorStatus(index) {
  const donor = registeredDonors[index];
  if (!donor) return;

  donor.available = !donor.available;

  // Sync strictly to donors collection in Firestore
  if (typeof db !== 'undefined' && db && donor.id) {
    try {
      await db.collection('donors').doc(donor.id).update({
        available: donor.available
      });
    } catch (err) {
      console.error('Update donor error:', err);
    }
  }

  showToast(`Donor status updated for ${donor.name}`, 'success');
  renderPage();
}

async function adminDeleteRequest(reqId) {
  if (typeof db !== 'undefined' && db) {
    try {
      await db.collection('bloodRequests').doc(reqId).delete();
    } catch (err) {
      console.error('Delete request error:', err);
    }
  }

  emergencyRequestsList = emergencyRequestsList.filter(r => r.id !== reqId);
  showToast(`Emergency request ${reqId} deleted from Firestore`, 'info');
  renderPage();
}

async function adminUpdateStock(bankId, delta) {
  const bank = BLOOD_BANKS.find(b => b.id === bankId);
  if (!bank) return;

  if (!bank.bloods) {
    bank.bloods = { 'O+': 40, 'A+': 30, 'B+': 25, 'AB+': 15, 'O-': 5, 'A-': 3, 'B-': 1, 'AB-': 1 };
  }

  const grps = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

  if (delta > 0) {
    bank.bloods['O+'] = (bank.bloods['O+'] || 0) + delta;
  } else {
    let remaining = Math.abs(delta);
    for (const g of grps) {
      const count = bank.bloods[g] || 0;
      if (count >= remaining) {
        bank.bloods[g] = count - remaining;
        remaining = 0;
        break;
      } else {
        remaining -= count;
        bank.bloods[g] = 0;
      }
    }
  }

  bank.units = Object.values(bank.bloods).reduce((sum, count) => sum + count, 0);

  if (typeof db !== 'undefined' && db) {
    try {
      await db.collection('bloodBanks').doc(bankId).update({
        units: bank.units,
        bloods: bank.bloods
      });
    } catch (err) {
      console.error('Stock update error:', err);
    }
  }

  showToast(`Stock updated for ${bank.name}: ${bank.units} total units`, 'success');
  renderPage();
}

function openAdminTimelineModal(reqId) {
  const req = emergencyRequestsList.find(r => r.id === reqId);
  if (!req) return;

  const steps = req.progressTimeline || [
    { step: 'Request Submitted', time: req.reqDate || req.createdAt },
    { step: 'Broadcast Sent to Blood Banks', time: req.reqDate || req.createdAt }
  ];

  const bodyHtml = `
    <div style="margin-bottom: 20px;">
      <h4 style="font-size: 1.15rem; font-weight: 800; margin: 0 0 6px;">Request ${req.id} Audit Timeline</h4>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">
        Patient: <strong>${req.patient || req.patientName}</strong> (${req.blood || req.bloodGroup}) • Hospital: ${req.hospital || req.hospitalName}
      </p>
    </div>

    <div style="background: var(--bg-muted); padding: 18px; border-radius: var(--radius-md); margin-bottom: 20px;">
      <div style="font-weight: 700; font-size: 0.85rem; color: var(--accent); margin-bottom: 12px;">STEP-BY-STEP PROGRESS LOG:</div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${steps.map((st, idx) => `
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-secondary); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 0.88rem;">
            <span><strong>Step ${idx + 1}:</strong> ${st.step}</span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">${new Date(st.time || Date.now()).toLocaleString()}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="display: flex; gap: 14px; font-size: 0.85rem; background: var(--bg-muted); padding: 12px; border-radius: var(--radius-md);">
      <div>Patient Confirmed: <strong style="color: ${req.patientConfirmed ? '#10b981' : '#f59e0b'};">${req.patientConfirmed ? 'YES ✅' : 'PENDING ⏳'}</strong></div>
      <div>Blood Bank Confirmed: <strong style="color: ${req.bankConfirmed ? '#10b981' : '#f59e0b'};">${req.bankConfirmed ? 'YES ✅' : 'PENDING ⏳'}</strong></div>
    </div>
  `;

  showModal(`Emergency Dispatch #${reqId}`, bodyHtml, [
    { text: 'Close Timeline', class: 'btn-outline', action: () => closeModal() }
  ]);
}

async function publishAlert(e) {
  e.preventDefault();
  const type = document.getElementById('alert-type').value;
  const text = document.getElementById('alert-text').value.trim();

  if (text && typeof db !== 'undefined' && db) {
    try {
      await db.collection('notifications').add({
        targetRole: 'all',
        title: type === 'critical' ? '🚨 CRITICAL NETWORK ALERT' : '⚠️ AMBER SHORTAGE WARNING',
        message: text,
        type: 'SYSTEM_ALERT',
        timestamp: new Date().toISOString(),
        read: false
      });
      showToast('🚨 Alert published to platform notifications collection in Firestore!', 'success');
      document.getElementById('alert-text').value = '';
      switchAdminTab('requests');
    } catch (err) {
      console.error('Publish alert error:', err);
    }
  }
}
