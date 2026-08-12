/* ===== LifeLink Validation Module ===== */

function validate10DigitPhone(phoneStr) {
  if (!phoneStr) return false;
  const cleanPhone = phoneStr.replace(/\D/g, '');
  return cleanPhone.length === 10;
}

function getCleanPhoneNumber(phoneStr) {
  if (!phoneStr) return '';
  return phoneStr.replace(/\D/g, '');
}

function isDuplicateDonorRecord(existingDonors, email, phone) {
  const cleanPhone = getCleanPhoneNumber(phone);
  const cleanEmail = email ? email.trim().toLowerCase() : '';

  return existingDonors.some(d =>
    (cleanPhone && d.phone && getCleanPhoneNumber(d.phone) === cleanPhone) ||
    (cleanEmail && d.email && d.email.trim().toLowerCase() === cleanEmail)
  );
}

function validateTwoPartName(nameStr) {
  if (!nameStr) return false;
  const trimmed = nameStr.trim();
  const parts = trimmed.split(/\s+/);
  return parts.length >= 2 && parts[0].length > 0 && parts[1].length > 0;
}

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  if (password.length < 6) return { score: 1, label: '🔴 Weak (min 6 characters)', color: '#ef4444' };
  
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  
  if (password.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
    return { score: 3, label: '🟢 Strong Password', color: '#10b981' };
  } else if (hasLetters && hasNumbers) {
    return { score: 2, label: '🟡 Medium Strength', color: '#f59e0b' };
  } else {
    return { score: 1, label: '🔴 Weak (use letters & numbers)', color: '#ef4444' };
  }
}
