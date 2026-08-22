/* ===== LifeLink Enterprise Blood Bank Portal & Inventory System ===== */

let activeBankTab = 'dashboard';

// Primary Portal View Renderer
function renderBloodBankPortal() {
  if (!currentBloodBankSession) {
    return `
      <section class="section" style="padding-top: calc(var(--header-height) + 60px); text-align: center;">
        <div class="container" style="max-width: 520px;">
          <div class="card glow-card" style="padding: 40px 28px;">
            <div style="font-size: 3.5rem; color: var(--accent); margin-bottom: 16px;">🏥</div>
            <h2 style="font-size: 1.65rem; font-weight: 800; margin-bottom: 12px;">Blood Bank Portal Access Required</h2>
            <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 0.95rem; line-height: 1.6;">
              Log in with your official blood center credentials or register your facility on the LifeLink e-RaktKosh Network.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button class="btn btn-primary btn-lg glow-card" onclick="openBloodBankLoginModal()">
                🔑 Blood Bank Login
              </button>
              <button class="btn btn-outline btn-lg" onclick="openBloodBankRegisterModal()">
                📝 Register Facility
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  const bank = currentBloodBankSession;
  const pendingRequestsCount = emergencyRequestsList.filter(r => r.status === 'PENDING' || r.status === 'Pending').length;

  return `
    <!-- Top Portal Header -->
    <div class="page-header" style="background: linear-gradient(180deg, var(--accent-light) 0%, var(--bg-primary) 100%); padding-top: calc(var(--header-height) + 28px); padding-bottom: 28px; border-bottom: 1px solid var(--border-color); text-align: left;">
      <div class="container" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 52px; height: 52px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; box-shadow: 0 4px 14px rgba(239,68,68,0.4);">
            🏥
          </div>
          <div>
            <h1 style="color: var(--text-primary); font-size: 1.7rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 10px;">
              ${bank.name}
              <span class="badge badge-green" style="font-size: 0.75rem; vertical-align: middle;">Verified License: ${bank.licenseNumber || 'DL-BB-9842'}</span>
            </h1>
            <p style="color: var(--text-secondary); margin: 4px 0 0; font-size: 0.88rem; display: flex; align-items: center; gap: 12px;">
              <span>📍 ${bank.location || bank.city || 'Mumbai, Maharashtra'}</span>
              <span>•</span>
              <span>📞 ${bank.phone || '+91 22 2345 6789'}</span>
              <span>•</span>
              <span>📧 ${bank.email}</span>
            </p>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="btn btn-outline btn-sm" onclick="openGoogleMapsLocation(${bank.latitude || 19.0760}, ${bank.longitude || 72.8777})" style="border-color: var(--border-color); color: var(--text-primary); background: var(--bg-secondary);">
            📍 Google Maps View
          </button>
          <button class="btn btn-outline btn-sm" onclick="handleBankLogout()" style="border-color: var(--accent); color: var(--accent);">
            Logout Facility
          </button>
        </div>
      </div>
    </div>

    <!-- Portal Body -->
    <section class="section" style="padding-top: 24px;">
      <div class="container">
        <!-- 9-Tab Navigation Sub-Bar -->
        <div class="bank-portal-tabs-bar" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--border-color);">
          <button class="bank-nav-tab ${activeBankTab === 'dashboard' ? 'active' : ''}" onclick="switchBankTab('dashboard')">📊 Dashboard</button>
          <button class="bank-nav-tab ${activeBankTab === 'inventory' ? 'active' : ''}" onclick="switchBankTab('inventory')">🩸 Inventory (${bank.units || 120} Units)</button>
          <button class="bank-nav-tab ${activeBankTab === 'requests' ? 'active' : ''}" onclick="switchBankTab('requests')">🚨 Emergency Requests <span class="badge badge-red" style="padding: 2px 6px;">${pendingRequestsCount}</span></button>
          <button class="bank-nav-tab ${activeBankTab === 'contract-donors' ? 'active' : ''}" onclick="switchBankTab('contract-donors')">👥 Contract Donors (${contractDonorsList.length})</button>
          <button class="bank-nav-tab ${activeBankTab === 'camps' ? 'active' : ''}" onclick="switchBankTab('camps')">${SVG_ICONS.camp(15)} Blood Camps (${bloodCollectionCampsList.length})</button>
          <button class="bank-nav-tab ${activeBankTab === 'ngo-partners' ? 'active' : ''}" onclick="switchBankTab('ngo-partners')">${SVG_ICONS.handshake(15)} NGO Partners (${ngoPartnersList.length})</button>
          <button class="bank-nav-tab ${activeBankTab === 'history' ? 'active' : ''}" onclick="switchBankTab('history')">📋 Bag Tracking</button>
          <button class="bank-nav-tab ${activeBankTab === 'reports' ? 'active' : ''}" onclick="switchBankTab('reports')">📈 Usage Reports</button>
          <button class="bank-nav-tab ${activeBankTab === 'settings' ? 'active' : ''}" onclick="switchBankTab('settings')">⚙️ Settings</button>
        </div>

        <!-- Render Tab Content -->
        <div id="bank-portal-tab-content">
          ${renderBankTabContent()}
        </div>
      </div>
    </section>
  `;
}

function switchBankTab(tabName) {
  activeBankTab = tabName;
  renderPage();
}

function renderBankTabContent() {
  switch (activeBankTab) {
    case 'inventory': return renderBankInventoryTab();
    case 'requests': return renderBankRequestsTab();
    case 'contract-donors': return renderBankContractDonorsTab();
    case 'camps': return renderBankCampsTab();
    case 'ngo-partners': return renderBankNGOPartnersTab();
    case 'history': return renderBankHistoryTab();
    case 'reports': return renderBankReportsTab();
    case 'settings': return renderBankSettingsTab();
    default: return renderBankDashboardTab();
  }
}

/* ===== TAB 1: DASHBOARD ===== */
function renderBankDashboardTab() {
  const bank = currentBloodBankSession;
  const pendingCount = emergencyRequestsList.filter(r => r.status === 'PENDING' || r.status === 'Pending').length;
  const acceptedCount = emergencyRequestsList.filter(r => r.acceptedBy && (r.acceptedBy.bankId === bank.id || r.acceptedBy.bankName === bank.name)).length;

  return `
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
      <div class="card glow-card" style="padding: 20px;">
        <div style="font-size: 0.82rem; color: var(--text-secondary); font-weight: 600;">NEW EMERGENCY BROADCASTS</div>
        <div style="font-size: 2.2rem; font-weight: 800; color: var(--accent); margin: 6px 0;">${pendingCount}</div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">Real-time patient dispatches</div>
      </div>
      <div class="card glow-card" style="padding: 20px;">
        <div style="font-size: 0.82rem; color: var(--text-secondary); font-weight: 600;">ACCEPTED BY THIS FACILITY</div>
        <div style="font-size: 2.2rem; font-weight: 800; color: #10b981; margin: 6px 0;">${acceptedCount}</div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">In delivery & confirmation pipeline</div>
      </div>
      <div class="card glow-card" style="padding: 20px;">
        <div style="font-size: 0.82rem; color: var(--text-secondary); font-weight: 600;">TOTAL STOCK INVENTORY</div>
        <div style="font-size: 2.2rem; font-weight: 800; color: #3b82f6; margin: 6px 0;">${bank.units || 120} <span style="font-size: 1rem; font-weight: 500;">Units</span></div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">Across 8 blood groups</div>
      </div>
      <div class="card glow-card" style="padding: 20px;">
        <div style="font-size: 0.82rem; color: var(--text-secondary); font-weight: 600;">CRITICAL RARE UNITS (O-, AB-)</div>
        <div style="font-size: 2.2rem; font-weight: 800; color: #f59e0b; margin: 6px 0;">${((bank.bloods && bank.bloods['O-']) || 0) + ((bank.bloods && bank.bloods['AB-']) || 0)} <span style="font-size: 1rem; font-weight: 500;">Units</span></div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">Low stock warnings active</div>
      </div>
    </div>

    <!-- Low Stock Alert Banner -->
    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--accent); border-radius: var(--radius-lg); padding: 16px 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 1.5rem;">⚠️</span>
        <div>
          <strong style="color: var(--accent); font-size: 0.95rem;">National Grid Low Stock Alert: O- & B- Component Shortage</strong>
          <p style="margin: 2px 0 0; font-size: 0.85rem; color: var(--text-secondary);">Please verify your PRBC and Single Donor Platelet stock counts.</p>
        </div>
      </div>
      <button class="btn btn-primary btn-sm glow-card" onclick="switchBankTab('inventory')">Manage Stock Now</button>
    </div>

    <!-- Inventory Quick Overview Matrix -->
    <div class="card" style="padding: 24px; margin-bottom: 24px;">
      <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">🩸 Current Blood Group Stock Distribution</h3>
      <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 10px; text-align: center;">
        ${Object.entries(bank.bloods || { 'O+': 40, 'A+': 30, 'B+': 25, 'AB+': 15, 'O-': 5, 'A-': 3, 'B-': 1, 'AB-': 1 }).map(([grp, count]) => `
          <div style="background: var(--bg-muted); padding: 14px 8px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <div style="font-weight: 800; color: var(--accent); font-size: 1.1rem;">${grp}</div>
            <div style="font-size: 1.4rem; font-weight: 800; margin: 4px 0;">${count}</div>
            <span class="badge ${count < 5 ? 'badge-red' : 'badge-green'}" style="font-size: 0.7rem; padding: 2px 4px;">${count < 5 ? 'LOW' : 'OK'}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ===== TAB 2: INVENTORY ===== */
function renderBankInventoryTab() {
  const bank = currentBloodBankSession;
  const groups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
  const components = ['Whole Blood', 'Platelets', 'Plasma', 'RBC (PRBC)', 'FFP', 'Cryoprecipitate'];

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <div>
        <h3 style="font-size: 1.3rem; font-weight: 800; margin: 0;">Detailed Component Inventory Management</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 0;">Manage component separation, available units, and expiry tracking in Firestore.</p>
      </div>
      <button class="btn btn-primary glow-card" onclick="openAddStockBatchModal()">
        + Add Blood Stock Batch
      </button>
    </div>

    <div class="card" style="padding: 0; overflow: hidden; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
        <thead style="background: var(--bg-muted); border-bottom: 1px solid var(--border-color);">
          <tr>
            <th style="padding: 14px 18px;">Blood Group</th>
            <th style="padding: 14px 18px;">Component Type</th>
            <th style="padding: 14px 18px;">Available Units</th>
            <th style="padding: 14px 18px;">Reserved Units</th>
            <th style="padding: 14px 18px;">Status / Expiry</th>
            <th style="padding: 14px 18px; text-align: right;">Quick Actions</th>
          </tr>
        </thead>
        <tbody>
          ${groups.map((grp, idx) => {
            const count = (bank.bloods && bank.bloods[grp]) || 0;
            return `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 14px 18px; font-weight: 800; color: var(--accent); font-size: 1.1rem;">
                  ${grp}
                </td>
                <td style="padding: 14px 18px;">
                  ${components[idx % components.length]}
                </td>
                <td style="padding: 14px 18px; font-weight: 700;">
                  ${count} Units
                </td>
                <td style="padding: 14px 18px; color: var(--text-secondary);">
                  ${Math.min(count, 2)} Units
                </td>
                <td style="padding: 14px 18px;">
                  <span class="badge ${count < 5 ? 'badge-red' : 'badge-green'}">
                    ${count < 5 ? 'CRITICAL STOCK' : 'READY FOR DISPATCH'}
                  </span>
                </td>
                <td style="padding: 14px 18px; text-align: right;">
                  <button class="btn btn-outline btn-sm" onclick="adjustBankGroupStock('${grp}', 1)">+ Unit</button>
                  <button class="btn btn-outline btn-sm" onclick="adjustBankGroupStock('${grp}', -1)" style="margin-left: 4px;">- Unit</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function adjustBankGroupStock(grp, delta) {
  const bank = currentBloodBankSession;
  if (!bank) return;
  if (!bank.bloods) bank.bloods = { 'O+': 40, 'A+': 30, 'B+': 25, 'AB+': 15, 'O-': 5, 'A-': 3, 'B-': 1, 'AB-': 1 };

  bank.bloods[grp] = Math.max(0, (bank.bloods[grp] || 0) + delta);
  bank.units = Object.values(bank.bloods).reduce((a, b) => a + b, 0);

  localStorage.setItem('lifelink_bank_session', JSON.stringify(bank));

  // Sync to Firestore bloodBanks and bloodInventory collections
  if (typeof db !== 'undefined' && db && bank.id) {
    try {
      await db.collection('bloodBanks').doc(bank.id).update({ bloods: bank.bloods, units: bank.units });
      await db.collection('bloodInventory').add({
        bankId: bank.id,
        bloodGroup: grp,
        unitsAdded: delta,
        availableUnits: bank.bloods[grp],
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Firestore inventory write error:', err);
    }
  }

  showToast(`Stock updated for ${grp}: ${bank.bloods[grp]} Units`, 'success');
  renderPage();
}

function openAddStockBatchModal() {
  const grp = prompt('Enter Blood Group (e.g. O+, A+, B-, AB+):', 'O+');
  if (!grp) return;
  const count = parseInt(prompt('Enter Number of Units to Add:', '10')) || 0;
  if (count > 0) {
    adjustBankGroupStock(grp.toUpperCase(), count);
  }
}

/* ===== TAB 3: EMERGENCY REQUESTS & DOUBLE CONFIRMATION ===== */
function renderBankRequestsTab() {
  const bank = currentBloodBankSession;

  return `
    <div style="margin-bottom: 20px;">
      <h3 style="font-size: 1.3rem; font-weight: 800; margin: 0;">Emergency Request Broadcast Console</h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 0;">Accept broadcasts, dispatch driver units, and confirm completion.</p>
    </div>

    <div style="display: grid; gap: 16px;">
      ${emergencyRequestsList.map(req => {
        const isAcceptedByUs = req.acceptedBy && (req.acceptedBy.bankId === bank.id || req.acceptedBy.bankName === bank.name);
        const progressSteps = req.progressTimeline || [
          { step: 'Request Submitted', time: req.reqDate || req.createdAt },
          { step: 'Broadcast Sent to Blood Banks', time: req.reqDate || req.createdAt }
        ];

        return `
          <div class="card glow-card" style="padding: 24px; border-left: 5px solid ${req.status === 'ACCEPTED' ? '#10b981' : 'var(--accent)'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
              <div>
                <span class="badge badge-red" style="margin-right: 8px;">${req.urgency || 'CRITICAL'}</span>
                <span class="badge badge-blue">REQ ID: ${req.id}</span>
                <h4 style="font-size: 1.25rem; font-weight: 800; margin: 8px 0 4px; color: var(--text-primary);">
                  Patient: ${req.patientName || req.patient} (${req.bloodGroup || req.blood} — ${req.units} Units)
                </h4>
                <p style="margin: 0; font-size: 0.88rem; color: var(--text-secondary);">
                  🏥 ${req.hospitalName || req.hospital} • 📍 ${req.city} • 📞 ${req.contactPhone || req.phone}
                </p>
              </div>

              <div style="text-align: right;">
                <span class="badge ${req.status === 'COMPLETED' ? 'badge-green' : (req.status === 'ACCEPTED' ? 'badge-blue' : 'badge-amber')}" style="font-size: 0.85rem; padding: 6px 12px;">
                  Status: ${req.status}
                </span>
                ${req.acceptedBy ? `<div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Accepted by: ${req.acceptedBy.bankName}</div>` : ''}
              </div>
            </div>

            <!-- Detailed Progress Timeline Stepper -->
            <div style="background: var(--bg-muted); padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
              <div style="font-weight: 700; font-size: 0.82rem; color: var(--accent); margin-bottom: 8px;">PROGRESS TIMELINE & DISPATCH STATUS:</div>
              <div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px;">
                ${progressSteps.map((st, i) => `
                  <div style="background: var(--bg-secondary); padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 0.78rem; white-space: nowrap;">
                    ✅ <strong>${st.step}</strong> <span style="color: var(--text-muted); font-size: 0.72rem;">(${new Date(st.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                  </div>
                `).join(' ➔ ')}
              </div>
            </div>

            <!-- Double Confirmation Badges -->
            <div style="display: flex; gap: 12px; margin-bottom: 16px; font-size: 0.85rem;">
              <div>
                Blood Bank Confirmed:
                <span class="badge ${req.bankConfirmed ? 'badge-green' : 'badge-amber'}">${req.bankConfirmed ? 'YES ✅' : 'PENDING ⏳'}</span>
              </div>
              <div>
                Hospital/Patient Confirmed:
                <span class="badge ${req.patientConfirmed ? 'badge-green' : 'badge-amber'}">${req.patientConfirmed ? 'YES ✅' : 'PENDING ⏳'}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              ${req.status === 'PENDING' || req.status === 'Pending' ? `
                <button class="btn btn-primary btn-sm glow-card" onclick="acceptEmergencyRequestByBank('${req.id}')">
                  ✅ Accept Request & Reserve Units
                </button>
              ` : ''}

              ${isAcceptedByUs && req.status !== 'COMPLETED' ? `
                <button class="btn btn-primary btn-sm glow-card" onclick="dispatchBloodUnitsModal('${req.id}')">
                  🚚 Dispatch Blood & Assign Driver
                </button>
                <button class="btn btn-outline btn-sm" onclick="confirmBloodBankDelivery('${req.id}')" style="border-color: #10b981; color: #10b981;">
                  ✔️ Confirm Bank Delivery Side
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

async function acceptEmergencyRequestByBank(reqId) {
  const bank = currentBloodBankSession;
  const req = emergencyRequestsList.find(r => r.id === reqId);
  if (!req || !bank) return;

  const NOW = new Date().toISOString();
  req.status = 'ACCEPTED';
  req.acceptedBy = { bankId: bank.id, bankName: bank.name, acceptedTime: NOW };
  req.acceptedBankId = bank.id;
  req.acceptedBankName = bank.name;
  req.acceptedAt = NOW;
  req.progressTimeline = req.progressTimeline || [];
  req.progressTimeline.push({ step: `Accepted by ${bank.name}`, time: NOW });

  if (typeof db !== 'undefined' && db) {
    try {
      await db.collection('bloodRequests').doc(reqId).update(req);
    } catch (err) {
      console.error('Accept error:', err);
    }
  }

  showToast(`🎉 You accepted Emergency Request #${reqId}! Unit reserved.`, 'success');
  renderPage();
}

async function dispatchBloodUnitsModal(reqId) {
  const driverName = prompt('Enter Dispatch Driver / Courier Name:', 'Rajesh Transport');
  if (!driverName) return;
  const req = emergencyRequestsList.find(r => r.id === reqId);
  if (!req) return;

  const NOW = new Date().toISOString();
  req.dispatchStatus = 'DISPATCHED';
  req.deliveryStatus = 'IN_TRANSIT';
  req.progressTimeline = req.progressTimeline || [];
  req.progressTimeline.push({ step: `Blood Dispatched (Driver: ${driverName})`, time: NOW });

  if (typeof db !== 'undefined' && db) {
    try {
      await db.collection('bloodRequests').doc(reqId).update(req);
      await db.collection('dispatches').add({
        requestId: reqId,
        bankId: currentBloodBankSession ? currentBloodBankSession.id : (req.acceptedBankId || 'BANK-001'),
        driverName: driverName,
        status: 'IN_TRANSIT',
        dispatchedAt: NOW
      });
    } catch (err) {
      console.error('Dispatch error:', err);
    }
  }

  showToast(`🚚 Blood units dispatched with driver ${driverName}!`, 'success');
  renderPage();
}

async function confirmBloodBankDelivery(reqId) {
  const req = emergencyRequestsList.find(r => r.id === reqId);
  if (!req) return;

  const NOW = new Date().toISOString();
  req.bankConfirmed = true;
  req.bloodBankDelivered = true;
  req.deliveryStatus = 'DELIVERED_BY_BANK';
  req.progressTimeline = req.progressTimeline || [];
  req.progressTimeline.push({ step: `Blood Bank Confirmed Delivery`, time: NOW });

  if (req.patientConfirmed) {
    req.status = 'COMPLETED';
    req.completedAt = NOW;
    req.deliveryStatus = 'FULLY_DELIVERED';
    req.progressTimeline.push({ step: `Double Confirmed & Completed`, time: NOW });
    showToast(`🎉 Request #${reqId} FULLY COMPLETED via Double Confirmation!`, 'success');
  } else {
    req.status = 'AWAITING_FINAL_CONFIRMATION';
    showToast(`✔️ Bank confirmed delivery! Awaiting Patient / Hospital confirmation.`, 'info');
  }

  if (typeof db !== 'undefined' && db) {
    try {
      await db.collection('bloodRequests').doc(reqId).update(req);
    } catch (err) {
      console.error('Confirm error:', err);
    }
  }
  renderPage();
}

/* ===== TAB 4: CONTRACT DONORS ===== */
function renderBankContractDonorsTab() {
  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <div>
        <h3 style="font-size: 1.3rem; font-weight: 800; margin: 0;">Contract & Frequent Donors Roster</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 0;">Dedicated donor roster for instant emergency callouts from contractDonors collection.</p>
      </div>
      <button class="btn btn-primary btn-sm glow-card" onclick="addContractDonorPrompt()">+ Register Contract Donor</button>
    </div>

    <div class="card" style="padding: 0; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
        <thead style="background: var(--bg-muted);">
          <tr>
            <th style="padding: 12px 16px;">Donor Name</th>
            <th style="padding: 12px 16px;">Blood Group</th>
            <th style="padding: 12px 16px;">Contact Phone</th>
            <th style="padding: 12px 16px;">Last Donation</th>
            <th style="padding: 12px 16px;">Status</th>
            <th style="padding: 12px 16px; text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${contractDonorsList.map(cd => `
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 12px 16px; font-weight: 700;">${cd.donorName}</td>
              <td style="padding: 12px 16px; font-weight: 800; color: var(--accent);">${cd.bloodGroup}</td>
              <td style="padding: 12px 16px;">${cd.phone}</td>
              <td style="padding: 12px 16px;">${cd.lastDonation || 'N/A'}</td>
              <td style="padding: 12px 16px;"><span class="badge badge-green">${cd.status || 'Ready'}</span></td>
              <td style="padding: 12px 16px; text-align: right;"><button class="btn btn-outline btn-sm" onclick="showToast('Calling donor ${cd.donorName}...', 'info')">📞 Call</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function addContractDonorPrompt() {
  const name = prompt('Enter Contract Donor Name:', 'Vikram Sharma');
  if (!name) return;
  const blood = prompt('Enter Blood Group (e.g. O-, A+):', 'O-');
  const phone = prompt('Enter 10-digit Phone:', '9876543210');

  if (typeof db !== 'undefined' && db) {
    try {
      await db.collection('contractDonors').add({
        bankId: currentBloodBankSession.id,
        donorName: name,
        bloodGroup: blood,
        phone: phone,
        lastDonation: new Date().toISOString().split('T')[0],
        status: 'Ready to Donate'
      });
      showToast('✅ Contract donor added to contractDonors Firestore collection!', 'success');
    } catch (err) {
      console.error(err);
    }
  }
}

/* ===== TAB 5: CAMPS ===== */
function renderBankCampsTab() {
  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <div>
        <h3 style="font-size: 1.3rem; font-weight: 800; margin: 0;">Blood Collection Camps & Drives</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 0;">Organize mobile donation camps from bloodCollectionCamps collection.</p>
      </div>
      <button class="btn btn-primary btn-sm glow-card" onclick="addCampPrompt()">+ Schedule New Camp</button>
    </div>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
      ${bloodCollectionCampsList.map(c => `
        <div class="card glow-card" style="padding: 20px;">
          <span class="badge ${c.status === 'COMPLETED' ? 'badge-blue' : 'badge-green'}" style="margin-bottom: 8px;">${c.status}</span>
          <h4 style="font-size: 1.15rem; font-weight: 800; margin: 4px 0;">${c.title}</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0 0 12px;">📍 ${c.location} • 📅 ${c.date}</p>
          <div style="font-size: 0.85rem;">Target: ${c.targetUnits} Units • Registered: ${c.registeredDonors || 0}</div>
        </div>
      `).join('')}
    </div>
  `;
}

async function addCampPrompt() {
  const title = prompt('Enter Camp Title:', 'Monsoon Mobile Drive');
  if (!title) return;
  const location = prompt('Enter Location:', 'Community Center, Mumbai');

  if (typeof db !== 'undefined' && db) {
    try {
      await db.collection('bloodCollectionCamps').add({
        bankId: currentBloodBankSession.id,
        title: title,
        location: location,
        date: new Date().toISOString().split('T')[0],
        targetUnits: 150,
        registeredDonors: 50,
        collectedUnits: 0,
        status: 'UPCOMING'
      });
      showToast('✅ Blood camp scheduled in Firestore!', 'success');
    } catch (err) {
      console.error(err);
    }
  }
}

/* ===== TAB 6: NGO PARTNERS ===== */
function renderBankNGOPartnersTab() {
  return `
    <div style="margin-bottom: 16px;">
      <h3 style="font-size: 1.3rem; font-weight: 800; margin: 0;">NGO & Foundation Partners</h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 0;">Collaborate on awareness and emergency mobilization from ngoPartners collection.</p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
      ${ngoPartnersList.map(ngo => `
        <div class="card" style="padding: 18px;">
          <h4 style="font-weight: 800; margin: 0 0 4px;">${ngo.ngoName}</h4>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0 0 8px;">Coverage: ${ngo.coverageArea}</p>
          <div style="font-size: 0.8rem;">Coordinator: ${ngo.coordinatorName} (${ngo.coordinatorPhone})</div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ===== TAB 7: BAG TRACKING HISTORY ===== */
function renderBankHistoryTab() {
  return `
    <div style="margin-bottom: 16px;">
      <h3 style="font-size: 1.3rem; font-weight: 800; margin: 0;">Individual Blood Unit Bag Tracker</h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 0;">Track barcode bags, TTI testing clearance, and transfusion logs.</p>
    </div>
    <div class="card" style="padding: 0; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
        <thead style="background: var(--bg-muted);">
          <tr>
            <th style="padding: 10px 14px;">Bag Barcode</th>
            <th style="padding: 10px 14px;">Blood Group</th>
            <th style="padding: 10px 14px;">Component</th>
            <th style="padding: 10px 14px;">TTI Test Status</th>
            <th style="padding: 10px 14px;">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 10px 14px; font-weight: 700;">#BAG-98421</td>
            <td style="padding: 10px 14px; font-weight: 800; color: var(--accent);">O+</td>
            <td style="padding: 10px 14px;">PRBC</td>
            <td style="padding: 10px 14px;"><span class="badge badge-green">HIV/HBV/HCV Cleared</span></td>
            <td style="padding: 10px 14px;"><span class="badge badge-blue">Available</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

/* ===== TAB 8: REPORTS ===== */
function renderBankReportsTab() {
  return `
    <div style="margin-bottom: 16px;">
      <h3 style="font-size: 1.3rem; font-weight: 800; margin: 0;">Usage Analytics & Expiry Reports</h3>
    </div>
    <div class="card" style="padding: 24px; text-align: center;">
      <h4>📈 Monthly Dispatch & Collection Metrics</h4>
      <p style="color: var(--text-secondary); font-size: 0.9rem;">Total Collected: ${reportsList[0] ? reportsList[0].totalCollected : 450} Units • Total Dispatched: ${reportsList[0] ? reportsList[0].totalDispatched : 410} Units • Expiry Rate: ${reportsList[0] ? reportsList[0].expiryRate : '0.8%'}</p>
    </div>
  `;
}

/* ===== TAB 9: SETTINGS ===== */
function renderBankSettingsTab() {
  const bank = currentBloodBankSession;

  return `
    <div class="card" style="padding: 24px; max-width: 600px;">
      <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 16px;">Facility Profile & Geolocation Settings</h3>
      <div class="form-group" style="margin-bottom: 12px;">
        <label>Blood Bank Name</label>
        <input type="text" class="form-control" value="${bank.name}" readonly>
      </div>
      <div class="form-group" style="margin-bottom: 12px;">
        <label>License Number</label>
        <input type="text" class="form-control" value="${bank.licenseNumber || 'DL-BB-9842'}" readonly>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
        <div class="form-group">
          <label>Latitude</label>
          <input type="number" step="any" class="form-control" id="bank-set-lat" value="${bank.latitude || 19.0760}">
        </div>
        <div class="form-group">
          <label>Longitude</label>
          <input type="number" step="any" class="form-control" id="bank-set-lng" value="${bank.longitude || 72.8777}">
        </div>
      </div>
      <button class="btn btn-primary glow-card" onclick="saveBankProfileSettings()">Save Settings to Firestore</button>
    </div>
  `;
}

async function saveBankProfileSettings() {
  const lat = parseFloat(document.getElementById('bank-set-lat').value) || 19.0760;
  const lng = parseFloat(document.getElementById('bank-set-lng').value) || 72.8777;

  currentBloodBankSession.latitude = lat;
  currentBloodBankSession.longitude = lng;
  localStorage.setItem('lifelink_bank_session', JSON.stringify(currentBloodBankSession));

  if (typeof db !== 'undefined' && db && currentBloodBankSession.id) {
    try {
      await db.collection('bloodBanks').doc(currentBloodBankSession.id).update({
        latitude: lat,
        longitude: lng
      });
    } catch (err) {
      console.error(err);
    }
  }

  showToast('Profile settings updated in Firestore', 'success');
}

function openGoogleMapsLocation(lat, lng) {
  window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
}
