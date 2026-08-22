/* ===== LifeLink Core Orchestrator & View Handlers ===== */

// Landing Page Renderer
function renderHome() {
  const activeDonors = registeredDonors.filter(d => d.available).length;
  const totalDonations = registeredDonors.reduce((sum, d) => sum + (d.donations || 0), 0);

  return `
    <section class="lp-hero">
      <div class="lp-hero-inner">
        <div class="lp-eyebrow">${SVG_ICONS.activity(16, 'var(--accent)')} Smart Emergency Blood Dispatch Network</div>
        <h1 class="lp-hero-title">
          Minutes Matter. <br><span class="lp-red">Lifesavers Connect Here.</span>
        </h1>
        <p class="lp-lede">
          LifeLink bridges critical blood shortage gaps by instantly matching patients, hospitals, and emergency dispatchers with verified active blood donors nearby.
        </p>

        <div class="lp-hero-ctas">
          <button class="btn btn-primary btn-lg glow-card" onclick="navigateTo('register')">
            ${SVG_ICONS.heart(20)} Become a Donor
          </button>
          <button class="btn btn-outline btn-lg lp-emergency-btn glow-card" onclick="navigateTo('emergency')">
            ${SVG_ICONS.siren(20)} Emergency Request
          </button>
        </div>

        <div class="lp-hero-pulse">
          <svg viewBox="0 0 1200 70" preserveAspectRatio="none">
            <path d="M0,35 L200,35 L220,10 L240,60 L260,20 L280,45 L300,35 L500,35 L520,5 L540,65 L560,15 L580,50 L600,35 L800,35 L820,12 L840,58 L860,22 L880,42 L900,35 L1200,35" />
          </svg>
        </div>
      </div>
    </section>

    <!-- Stats Counter Bar -->
    <div class="lp-stats-row reveal-up">
      <div class="lp-stat">
        <div class="stat-number">${registeredDonors.length}</div>
        <div class="lp-stat-label">Registered Donors</div>
      </div>
      <div class="lp-stat">
        <div class="stat-number">${activeDonors}</div>
        <div class="lp-stat-label">Active & Ready</div>
      </div>
      <div class="lp-stat">
        <div class="stat-number">${totalDonations}</div>
        <div class="lp-stat-label">Lives Impacted</div>
      </div>
      <div class="lp-stat">
        <div class="stat-number">${BLOOD_BANKS.length || 5}</div>
        <div class="lp-stat-label">Blood Banks Connected</div>
      </div>
    </div>

    <!-- Solution Grid -->
    <section class="section lp-problem-section">
      <div class="container">
        <div class="lp-section-head reveal-up">
          <div class="lp-eyebrow">THE PROBLEM</div>
          <h2>A shortage measured in minutes, not units</h2>
        </div>

        <div class="lp-problem-grid">
          <div class="lp-problem-card reveal-up stagger-1">
            <div class="lp-problem-num">01</div>
            <h3>Rare groups vanish fast</h3>
            <p>AB-, B- and O- make up a fraction of the donor pool, so hospitals often have zero units on hand when a critical case arrives.</p>
          </div>

          <div class="lp-problem-card reveal-up stagger-2">
            <div class="lp-problem-num">02</div>
            <h3>Families search blind</h3>
            <p>Relatives call friends, post on social media, and wait — with no way to see who's nearby, eligible, and actually available right now.</p>
          </div>

          <div class="lp-problem-card reveal-up stagger-3">
            <div class="lp-problem-num">03</div>
            <h3>Donors go untracked</h3>
            <p>Willing donors exist everywhere, but without a shared network, hospitals can't reach them the moment it matters.</p>
          </div>
        </div>

        <!-- CTA Banner -->
        <div class="lp-cta-banner reveal-scale">
          <div>
            <h2>Your donation can restart a heartbeat.</h2>
            <p>Join the network — it takes two minutes to register, and you could be the reason someone makes it through the night.</p>
          </div>
          <button class="btn btn-primary btn-lg glow-card" onclick="navigateTo('register')">
            Register as Donor
          </button>
        </div>
      </div>
    </section>
  `;
}

// Awareness Page Renderer
function renderAwareness() {
  return `
    <div class="page-header" style="text-align: center; padding-top: calc(var(--header-height) + 40px); padding-bottom: 20px; background: transparent;">
      <div class="container">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #111827; margin-bottom: 8px; font-family: 'Outfit', sans-serif;">
          Blood Donation <span style="color: #dc2626;">Awareness</span>
        </h1>
        <p style="font-size: 1.05rem; color: #6b7280; margin: 0;">
          Learn everything about blood donation and why it matters.
        </p>
      </div>
    </div>

    <section class="section" style="padding-top: 20px; padding-bottom: 60px;">
      <div class="container">
        <div class="awareness-grid-3col">
          <!-- Card 1: Benefits -->
          <div class="awareness-card-new animate-on-scroll">
            <div class="awareness-card-header">
              <span class="awareness-card-icon">💪</span>
              <h3>Benefits of Blood Donation</h3>
            </div>
            <ul class="awareness-list">
              <li>
                <span class="awareness-dot"></span>
                <span>Saves up to 3 lives with a single donation</span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span>Free health screening before every donation</span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span>Reduces risk of heart disease and cancer</span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span>Stimulates production of new blood cells</span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span>Burns approximately 650 calories per donation</span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span>Gives a sense of purpose and community service</span>
              </li>
            </ul>
          </div>

          <!-- Card 2: Who Can Donate -->
          <div class="awareness-card-new animate-on-scroll">
            <div class="awareness-card-header">
              <span class="awareness-card-icon-box green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <h3>Who Can Donate Blood</h3>
            </div>
            <ul class="awareness-list">
              <li>
                <span class="awareness-dot"></span>
                <span>Age between 18 to 65 years</span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span>Minimum weight of 50 kg (110 lbs)</span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span>Hemoglobin level at least 12.5 g/dL</span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span>No chronic illnesses or infections</span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span>Have not donated in the last 3 months</span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span>In good general health on donation day</span>
              </li>
            </ul>
          </div>

          <!-- Card 3: Who Cannot Donate -->
          <div class="awareness-card-new animate-on-scroll">
            <div class="awareness-card-header">
              <span class="awareness-card-icon-box red">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </span>
              <h3>Who Cannot Donate Blood</h3>
            </div>
            <ul class="awareness-list">
              <li>
                <span class="awareness-dot"></span>
                <span>Individuals with HIV, Hepatitis B/C</span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span>Pregnant or breastfeeding women</span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span>People with heart, kidney, or liver disease</span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span>Those on certain medications (anticoagulants)</span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span>People with recent tattoos or piercings (6 months)</span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span>Individuals under the influence of alcohol</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Second Row: 2 centered cards -->
        <div class="awareness-grid-2col-centered">
          <!-- Card 4: Common Myths Debunked -->
          <div class="awareness-card-new animate-on-scroll">
            <div class="awareness-card-header">
              <span class="awareness-card-icon-box orange">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              </span>
              <h3>Common Myths Debunked</h3>
            </div>
            <ul class="awareness-list">
              <li>
                <span class="awareness-dot"></span>
                <span><strong>Myth:</strong> Donating blood makes you weak → <em style="color:#dc2626;">You recover within 24–48 hours</em></span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span><strong>Myth:</strong> You can get diseases from donating → <em style="color:#dc2626;">Sterile, single-use equipment is always used</em></span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span><strong>Myth:</strong> Vegetarians can't donate → <em style="color:#dc2626;">Diet doesn't affect eligibility if you're healthy</em></span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span><strong>Myth:</strong> It's very painful → <em style="color:#dc2626;">Only a small pinch, over in seconds</em></span>
              </li>
              <li>
                <span class="awareness-dot"></span>
                <span><strong>Myth:</strong> Blood donation takes hours → <em style="color:#dc2626;">The actual process takes only 8–10 minutes</em></span>
              </li>
            </ul>
          </div>

          <!-- Card 5: Safety of Blood Donation -->
          <div class="awareness-card-new animate-on-scroll">
            <div class="awareness-card-header">
              <span class="awareness-card-icon">🛡️</span>
              <h3>Safety of Blood Donation</h3>
            </div>
            <div class="awareness-safety-grid">
              <ul class="awareness-list">
                <li>
                  <span class="awareness-dot"></span>
                  <span>All equipment is sterile, single-use, and disposable</span>
                </li>
                <li>
                  <span class="awareness-dot"></span>
                  <span>Pre-donation health check ensures donor safety</span>
                </li>
                <li>
                  <span class="awareness-dot"></span>
                  <span>Donors are given refreshments and rest time post-donation</span>
                </li>
              </ul>
              <ul class="awareness-list">
                <li>
                  <span class="awareness-dot"></span>
                  <span>Trained medical staff supervise every step</span>
                </li>
                <li>
                  <span class="awareness-dot"></span>
                  <span>Blood is tested for infectious diseases before use</span>
                </li>
                <li>
                  <span class="awareness-dot"></span>
                  <span>Adverse reactions are extremely rare (less than 1%)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  `;
}

// Dashboard Page Renderer
function renderDashboard() {
  // Calculate blood group requests dynamically from Firestore emergencyRequestsList
  const groupCounts = {};
  BLOOD_GROUPS.forEach(g => { groupCounts[g] = 0; });

  emergencyRequestsList.forEach(r => {
    const grp = r.blood || r.bloodGroup;
    if (grp && groupCounts[grp] !== undefined) {
      groupCounts[grp] += (r.units || 1);
    }
  });

  const totalRequests = Object.values(groupCounts).reduce((a, b) => a + b, 0);

  // Calculate region demand dynamically
  const cityCounts = {};
  emergencyRequestsList.forEach(r => {
    if (r.city) cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
  });
  registeredDonors.forEach(d => {
    if (d.city) cityCounts[d.city] = (cityCounts[d.city] || 0) + 1;
  });

  const sortedRegions = Object.entries(cityCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const barColors = {
    'O+': 'db-bar-red', 'A+': 'db-bar-red',
    'B+': 'db-bar-blue', 'O-': 'db-bar-blue',
    'AB+': 'db-bar-green', 'A-': 'db-bar-amber',
    'B-': 'db-bar-amber', 'AB-': 'db-bar-amber'
  };

  const maxVal = Math.max(...Object.values(groupCounts), 1);

  return `
    <!-- Dashboard Header -->
    <div class="db-page-header">
      <div class="container">
        <h1 class="db-title">Data Analytics <span>Dashboard</span></h1>
        <p class="db-subtitle">Real-time insights calculated dynamically from Firestore collections.</p>
      </div>
    </div>

    <section class="section" style="padding-top: 20px; padding-bottom: 60px;">
      <div class="container">
        <div class="db-main-grid">

          <!-- LEFT COLUMN -->
          <div class="db-left-col">
            <!-- Bar Chart Card -->
            <div class="db-card animate-on-scroll">
              <div class="db-card-header">
                <span class="db-card-icon">🩸</span>
                <h3>Blood Groups Most Requested</h3>
              </div>
              <div class="db-bar-chart">
                ${Object.entries(groupCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([group, val]) => {
        const pct = Math.round((val / maxVal) * 100);
        const cls = barColors[group] || 'db-bar-blue';
        return `
                      <div class="db-bar-row">
                        <span class="db-bar-label">${group}</span>
                        <div class="db-bar-track">
                          <div class="db-bar-fill ${cls}" data-width="${pct}%">
                            <span class="db-bar-text">${val} units</span>
                          </div>
                        </div>
                      </div>
                    `;
      }).join('')}
              </div>
            </div>

            <!-- Alerts Card -->
            <div class="db-card db-card-alerts animate-on-scroll" style="margin-top: 24px;">
              <div class="db-card-header">
                <span class="db-card-icon-box amber">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </span>
                <h3>Live Network Broadcast Notifications</h3>
              </div>
              <div class="db-alerts-list">
                ${(() => {
                  const sorted = [...notificationsList].sort((a, b) => new Date(b.timestamp || b.createdAt || b.registeredAt || 0) - new Date(a.timestamp || a.createdAt || a.registeredAt || 0));
                  const latest = sorted.slice(0, 5);
                  return latest.length > 0 ? latest.map(n => `
                    <div class="db-alert-item db-alert-critical">
                      <span class="db-alert-dot db-dot-critical"></span>
                      <span class="db-alert-text"><strong>${n.title || 'Notification'}:</strong> ${n.message}</span>
                    </div>
                  `).join('') : `
                    <div class="db-alert-item db-alert-warning">
                      <span class="db-alert-dot db-dot-warning"></span>
                      <span class="db-alert-text">AB- and O- blood units running low across regional blood banks</span>
                    </div>
                  `;
                })()}
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN -->
          <div class="db-right-col">
            <!-- Regions Card -->
            <div class="db-card animate-on-scroll">
              <div class="db-card-header">
                <span class="db-card-icon">📍</span>
                <h3>Regions with Highest Demand</h3>
              </div>
              <div class="db-regions-list">
                ${sortedRegions.slice(0, 5).map((r, i) => `
                  <div class="db-region-row">
                    <div class="db-region-rank">#${i + 1}</div>
                    <div class="db-region-name">${r.name}</div>
                    <div class="db-region-count">${r.count}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="db-quick-stats animate-on-scroll" style="margin-top: 24px;">
              <div class="db-card-header" style="padding: 0 0 16px 0;">
                <span class="db-card-icon">📊</span>
                <h3>Live Network Metrics</h3>
              </div>
              <div class="db-stat-pill db-stat-red">
                <div class="db-stat-num">${totalRequests}</div>
                <div class="db-stat-lbl">Total units requested</div>
              </div>
              <div class="db-stat-pill db-stat-green">
                <div class="db-stat-num">94%</div>
                <div class="db-stat-lbl">Fulfillment rate</div>
              </div>
              <div class="db-stat-pill db-stat-blue">
                <div class="db-stat-num">${BLOOD_BANKS.length}</div>
                <div class="db-stat-lbl">Active blood banks connected</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  `;
}

function animateDashboardBars() {
  document.querySelectorAll('.bar-fill, .db-bar-fill').forEach(bar => {
    const targetWidth = bar.dataset.width;
    setTimeout(() => {
      bar.style.width = targetWidth;
    }, 150);
  });
}

// Initial Bootstrapper
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initTheme === 'function') initTheme();
  initFirebaseBackend();

  // Bind nav link clicks using data-page attribute
  document.querySelectorAll('.nav a[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      if (page) navigateTo(page);
    });
  });

  // Route from hash or default to home
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) {
    navigateTo(initialHash);
  } else {
    renderPage();
  }

  // Header scroll shadow handler
  window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }
  });

  // Handle hash changes (browser back/forward)
  window.addEventListener('hashchange', () => {
    const pageId = window.location.hash.replace('#', '');
    if (pageId && pageId !== currentPage) {
      navigateTo(pageId);
    }
  });
});
