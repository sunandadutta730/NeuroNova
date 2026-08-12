/* ===== LifeLink Authentication & Profile System ===== */

let currentUserAccount = JSON.parse(localStorage.getItem('lifelink_current_user')) || null;
let isAdminLoggedIn = localStorage.getItem('lifelink_admin_logged_in') === 'true';

function saveAccountToLocalStore(userObj) {
  const existing = JSON.parse(localStorage.getItem('lifelink_users_db')) || [];
  const idx = existing.findIndex(u => u.email === userObj.email);
  if (idx >= 0) existing[idx] = userObj;
  else existing.push(userObj);
  localStorage.setItem('lifelink_users_db', JSON.stringify(existing));
}

function findExistingAccount(email, phone) {
  const cleanPhone = getCleanPhoneNumber(phone);
  const cleanEmail = email ? email.trim().toLowerCase() : '';

  // 1. Search in-memory users list from Firestore
  if (typeof allUsersList !== 'undefined' && allUsersList.length > 0) {
    const found = allUsersList.find(u =>
      (cleanEmail && u.email && u.email.trim().toLowerCase() === cleanEmail) ||
      (cleanPhone && u.phone && getCleanPhoneNumber(u.phone) === cleanPhone)
    );
    if (found) return found;
  }

  // 2. Fallback to localStorage
  const existing = JSON.parse(localStorage.getItem('lifelink_users_db')) || [];
  return existing.find(u =>
    (cleanEmail && u.email && u.email.trim().toLowerCase() === cleanEmail) ||
    (cleanPhone && u.phone && getCleanPhoneNumber(u.phone) === cleanPhone)
  );
}

window.pendingPostLoginAction = null;

function isUserAuthenticated() {
  if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
    return true;
  }
  return currentUserAccount !== null || isAdminLoggedIn || currentBloodBankSession !== null;
}

function requireUserAuth(actionCallback, actionName = 'continue') {
  if (isUserAuthenticated()) {
    if (typeof actionCallback === 'function') actionCallback();
    return true;
  }

  window.pendingPostLoginAction = typeof actionCallback === 'function' ? actionCallback : null;
  openAuthModal('login', 'user', `Please log in or create an account to ${actionName}.`);
  return false;
}

function openAuthModal(mode = 'signup', role = 'user', customSubtext = null) {
  closeModal();
  const isSignup = mode === 'signup';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width: 440px; border-radius: var(--radius-xl); padding: 32px; box-shadow: var(--shadow-xl);">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="width: 52px; height: 52px; background: linear-gradient(135deg, var(--red-500), var(--red-700)); border-radius: var(--radius-md); display: inline-flex; align-items: center; justify-content: center; color: #fff; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(220,38,38,0.3);">
          ${SVG_ICONS.droplet(28, '#ffffff')}
        </div>
        <h3 id="auth-modal-title" style="font-size: 1.45rem; font-weight: 800; color: var(--gray-900); margin: 0 0 6px;">
          ${isSignup ? 'Create LifeLink Account' : 'Welcome Back'}
        </h3>
        ${customSubtext ? `<p style="font-size: 0.88rem; color: var(--accent); font-weight: 700; background: var(--red-50); padding: 6px 12px; border-radius: var(--radius-sm); margin: 0 0 8px;">${customSubtext}</p>` : ''}
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0;">
          ${isSignup ? 'Join thousands of registered blood donors saving lives' : 'Sign in to manage your donor profile & requests'}
        </p>
      </div>

      <div class="login-role-selector" style="margin-bottom: 20px;">
        <button class="login-role-btn ${role === 'user' ? 'active' : ''}" onclick="switchAuthRole('user')">
          ${SVG_ICONS.users(15)} Donor / User
        </button>
        <button class="login-role-btn ${role === 'admin' ? 'active' : ''}" onclick="switchAuthRole('admin')">
          ${SVG_ICONS.shield(15)} Administrator
        </button>
      </div>

      <div id="user-auth-fields" style="${role === 'admin' ? 'display:none;' : 'display:block;'}">
        <!-- Google Quick Login (User only) -->
        <button type="button" class="btn btn-outline glow-card" onclick="handleGoogleAuth()" style="width: 100%; border-color: var(--gray-300); color: var(--gray-800); background: #ffffff; margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 600; padding: 10px;">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
          Continue with Google
        </button>

        <div style="display: flex; align-items: center; margin-bottom: 16px; color: var(--gray-400); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px;">
          <div style="flex:1; height:1px; background: var(--gray-200);"></div>
          <span style="padding: 0 10px;">or with email</span>
          <div style="flex:1; height:1px; background: var(--gray-200);"></div>
        </div>
      </div>

      <form id="auth-form" onsubmit="${isSignup ? "handleAuthSignup(event, '" + role + "')" : "handleAuthLogin(event, '" + role + "')"}" style="text-align: left;">
        ${isSignup ? `
          <div class="form-group" style="text-align: left; margin-bottom: 10px;">
            <label>Full Name <span class="required">*</span></label>
            <input type="text" class="form-control" id="auth-name" placeholder="e.g. Rahul Sharma" required>
          </div>
        ` : ''}

        <div class="form-group" style="text-align: left; margin-bottom: 10px;">
          <label>Email Address <span class="required">*</span></label>
          <input type="email" class="form-control" id="auth-email" placeholder="name@example.com" required>
        </div>

        ${isSignup ? `
          <div class="form-group" style="text-align: left; margin-bottom: 10px;">
            <label>Phone Number <span class="required">*</span></label>
            <input type="tel" class="form-control" id="auth-phone" placeholder="10-digit mobile number" required maxlength="10" minlength="10" pattern="[0-9]{10}">
          </div>
        ` : ''}

        <div class="form-group" style="text-align: left; margin-bottom: 16px;">
          <label>${role === 'admin' ? 'Passcode / Password' : 'Password'} <span class="required">*</span></label>
          <input type="password" class="form-control" id="auth-password" placeholder="${role === 'admin' ? 'Enter admin passcode' : 'Minimum 6 characters'}" required minlength="${role === 'admin' ? '1' : '6'}">
          ${isSignup ? `<div id="password-strength-indicator" style="margin-top: 5px; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); display: none;"></div>` : ''}
        </div>

        <button type="submit" class="btn btn-primary btn-lg glow-card" style="width: 100%; margin-top: 4px; font-size: 1rem;">
          ${isSignup ? 'Create Account' : (role === 'admin' ? 'Sign In as Admin' : 'Sign In')}
        </button>
      </form>

      <div style="margin-top: 20px; text-align: center; font-size: 0.85rem; color: var(--text-secondary);" id="auth-toggle-container">
        ${isSignup
          ? `Already have an account? <a href="#" onclick="switchAuthMode('login', '${role}'); return false;" style="color: var(--accent); font-weight:700;">Log In</a>`
          : `Don't have an account? <a href="#" onclick="switchAuthMode('signup', '${role}'); return false;" style="color: var(--accent); font-weight:700;">Sign Up Free</a>`
        }
      </div>

      <button type="button" class="btn btn-outline btn-sm" onclick="closeModal()" style="width: 100%; margin-top: 14px; border-color: var(--gray-200); color: var(--gray-600);">Cancel</button>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
}

function switchAuthRole(role) {
  const title = document.getElementById('auth-modal-title');
  const userFields = document.getElementById('user-auth-fields');
  const form = document.getElementById('auth-form');
  const passInput = document.getElementById('auth-password');

  document.querySelectorAll('.login-role-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(role));
  });

  if (role === 'admin') {
    if (title) title.textContent = 'Admin Control Gate 🔐';
    if (userFields) userFields.style.display = 'none';
    if (passInput) passInput.placeholder = 'Enter admin passcode (e.g. admin123)';
    if (form) form.setAttribute('onsubmit', "handleAuthLogin(event, 'admin')");
  } else {
    if (title) title.textContent = 'Welcome Back';
    if (userFields) userFields.style.display = 'block';
    if (passInput) passInput.placeholder = 'Minimum 6 characters';
    if (form) form.setAttribute('onsubmit', "handleAuthLogin(event, 'user')");
  }
}

function switchAuthMode(mode, role = 'user') {
  openAuthModal(mode, role);
}

async function handleAuthSignup(e, role) {
  e.preventDefault();
  const name = document.getElementById('auth-name').value.trim();
  const email = document.getElementById('auth-email').value.trim().toLowerCase();
  const phone = document.getElementById('auth-phone').value.trim();
  const password = document.getElementById('auth-password').value;

  if (!validateTwoPartName(name)) {
    showToast('⚠️ Please enter both your first name and last name (e.g. Rahul Sharma).', 'error');
    return;
  }

  if (!validate10DigitPhone(phone)) {
    showToast('⚠️ Mobile number must contain exactly 10 digits.', 'error');
    return;
  }

  if (typeof getPasswordStrength === 'function') {
    const strength = getPasswordStrength(password);
    if (strength.score < 2) {
      showToast('⚠️ Please use a more secure password (minimum 6 characters, mixing letters and numbers).', 'error');
      return;
    }
  }

  // 1. Check duplicate accounts in Firestore
  if (typeof db !== 'undefined' && db) {
    try {
      const snap = await db.collection('users').where('email', '==', email).get();
      if (!snap.empty) {
        showToast('⚠️ A user with this email address is already registered!', 'error');
        return;
      }
    } catch (err) {
      console.warn('Duplicate check warning:', err.message);
    }
  }

  completeUserSignup(name, email, phone, password, role);
}

function completeUserSignup(name, email, phone, password, role) {
  const userAccount = {
    name,
    email,
    phone,
    password,
    role: role === 'admin' ? 'admin' : 'donor',
    signedUpAt: new Date().toISOString()
  };

  saveAccountToLocalStore(userAccount);

  if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length && firebase.auth) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        userAccount.uid = userCredential.user.uid;
        completeLoginProcess(userAccount, role);
        saveUserAccountToFirebase(userAccount);
      })
      .catch((err) => {
        if (err.code === 'auth/email-already-in-use') {
          showToast('⚠️ This email is already registered in Firebase. Logging in...', 'info');
          // Attempt login with provided credentials
          firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
              userAccount.uid = userCredential.user.uid;
              completeLoginProcess(userAccount, role);
            })
            .catch(() => {
              showToast('❌ Email already in use by another account.', 'error');
            });
        } else {
          console.error('Firebase createUser error:', err.message);
          showToast(`❌ Sign Up Failed: ${err.message}`, 'error');
        }
      });
  } else {
    completeLoginProcess(userAccount, role);
    saveUserAccountToFirebase(userAccount);
  }
}

function handleAuthLogin(e, role) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value.trim().toLowerCase();
  const password = document.getElementById('auth-password').value;

  if (role === 'admin') {
    const adminPass = (window.firebaseConfig && window.firebaseConfig.adminPassword) || 'admin123';
    const adminEmail = (window.firebaseConfig && window.firebaseConfig.adminEmail) || 'admin@lifelink.org';

    if (password === adminPass) {
      isAdminLoggedIn = true;
      localStorage.setItem('lifelink_admin_logged_in', 'true');

      const adminAccount = {
        name: 'System Administrator',
        email: email || adminEmail,
        role: 'admin',
        loggedInAt: new Date().toISOString()
      };
      currentUserAccount = adminAccount;
      localStorage.setItem('lifelink_current_user', JSON.stringify(adminAccount));

      closeModal();
      showToast('🛡️ Welcome, Administrator! Access Granted.', 'success');
      navigateTo('admin');
      saveUserLoginToFirebase({ email: adminAccount.email, role: 'admin', timestamp: new Date().toISOString() });
    } else {
      showToast('❌ Incorrect Admin Passcode! Access Denied.', 'error');
    }
    return;
  }

  // 1. Firebase Auth Attempt
  if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length && firebase.auth) {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const fbUser = userCredential.user;
        const localAcc = findExistingAccount(email, null) || {
          uid: fbUser.uid,
          name: fbUser.displayName || email.split('@')[0],
          email: fbUser.email,
          role: 'donor'
        };
        localAcc.uid = fbUser.uid;
        completeLoginProcess(localAcc, 'user');
      })
      .catch((err) => {
        if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          showToast('❌ Invalid email or wrong password. Access denied.', 'error');
        } else if (err.code === 'auth/user-not-found') {
          showToast('❌ Account not found. Please Sign Up.', 'error');
        } else {
          console.warn('Firebase sign-in notice:', err.message);
          handleLocalLoginFallback(email, password);
        }
      });
  } else {
    handleLocalLoginFallback(email, password);
  }
}

function handleLocalLoginFallback(email, password) {
  const account = findExistingAccount(email, null);
  if (!account) {
    showToast('❌ Account not found. Please check your email or Sign Up.', 'error');
    return;
  }

  if (account.password && account.password !== password) {
    showToast('❌ Incorrect password! Please check your credentials.', 'error');
    return;
  }

  completeLoginProcess(account, account.role || 'user');
}

function completeLoginProcess(accountObj, role) {
  currentUserAccount = accountObj;
  localStorage.setItem('lifelink_current_user', JSON.stringify(accountObj));

  if (role === 'admin' || accountObj.role === 'admin') {
    isAdminLoggedIn = true;
    localStorage.setItem('lifelink_admin_logged_in', 'true');
  }

  closeModal();
  showToast(`🎉 Welcome back, ${accountObj.name || accountObj.email}!`, 'success');
  updateAuthHeader();
  renderPage();

  saveUserLoginToFirebase({
    name: accountObj.name,
    email: accountObj.email,
    role: role || accountObj.role || 'user',
    timestamp: new Date().toISOString()
  });

  if (window.pendingPostLoginAction) {
    const postAction = window.pendingPostLoginAction;
    window.pendingPostLoginAction = null;
    setTimeout(() => {
      postAction();
    }, 200);
  }
}

function handleGoogleAuth() {
  // Ensure Firebase is initialized
  if (typeof firebase !== 'undefined' && (!firebase.apps || !firebase.apps.length) && typeof initFirebaseBackend === 'function') {
    initFirebaseBackend();
  }

  if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length && firebase.auth) {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        const googleAccount = {
          uid: user.uid,
          name: user.displayName || 'Google User',
          email: user.email,
          role: 'donor',
          photoURL: user.photoURL,
          provider: 'google',
          signedUpAt: new Date().toISOString()
        };

        saveAccountToLocalStore(googleAccount);
        completeLoginProcess(googleAccount, 'user');
        saveUserAccountToFirebase(googleAccount);
      })
      .catch((error) => {
        console.error('Google Auth Popup error:', error.code, error.message);
        if (error.code === 'auth/popup-closed-by-user') {
          showToast('ℹ️ Sign-in popup closed before completion.', 'info');
        } else if (error.code === 'auth/unauthorized-domain') {
          showToast('⚠️ Domain not authorized in Firebase Console.', 'error');
        } else {
          showToast(`❌ Google Sign-In: ${error.message}`, 'error');
        }
      });
  } else {
    showToast('⚡ Firebase authentication services are initializing. Please try again in a moment.', 'info');
  }
}

function handleUserLogout() {
  currentUserAccount = null;
  isAdminLoggedIn = false;
  localStorage.removeItem('lifelink_current_user');
  localStorage.removeItem('lifelink_admin_logged_in');

  if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length && firebase.auth) {
    firebase.auth().signOut().catch(() => { });
  }

  showToast('👋 You have been logged out safely.', 'info');
  updateAuthHeader();
  navigateTo('home');
}

function openUserProfileModal() {
  if (!currentUserAccount) return;

  const displayName = currentUserAccount.name || (currentUserAccount.email ? currentUserAccount.email.split('@')[0] : 'User');
  const firstInitial = displayName.charAt(0).toUpperCase();

  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #dc2626, #991b1b); color: #fff; font-size: 2rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(220, 38, 38, 0.4); margin-bottom: 12px;">
        ${firstInitial}
      </div>
      <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--gray-900); margin: 0;">${displayName}</h3>
      <span class="badge badge-green" style="margin-top: 6px;">Verified Member</span>
    </div>

    <div style="background: var(--gray-50); border-radius: var(--radius-md); padding: 16px; margin-bottom: 24px; text-align: left;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem;">
        <span style="color: var(--text-secondary); font-weight: 600;">Email:</span>
        <strong style="color: var(--gray-900);">${currentUserAccount.email || 'N/A'}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem;">
        <span style="color: var(--text-secondary); font-weight: 600;">Phone:</span>
        <strong style="color: var(--gray-900);">${currentUserAccount.phone || 'N/A'}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
        <span style="color: var(--text-secondary); font-weight: 600;">Role:</span>
        <strong style="color: var(--accent); text-transform: capitalize;">${currentUserAccount.role || 'User'}</strong>
      </div>
    </div>
  `;

  showModal('My Profile', bodyHtml, [
    { text: 'Close', class: 'btn-outline', action: () => closeModal() },
    { text: 'Log Out', class: 'btn-primary', action: () => { closeModal(); handleUserLogout(); } }
  ]);
}

// Global listener to update password strength indicators dynamically on type
document.addEventListener('input', (e) => {
  if (e.target && e.target.id === 'auth-password') {
    const strengthEl = document.getElementById('password-strength-indicator');
    if (!strengthEl) return;
    
    const pwd = e.target.value;
    if (!pwd) {
      strengthEl.style.display = 'none';
      return;
    }
    
    if (typeof getPasswordStrength === 'function') {
      const strength = getPasswordStrength(pwd);
      strengthEl.style.display = 'block';
      strengthEl.textContent = strength.label;
      strengthEl.style.color = strength.color;
    }
  }
});
