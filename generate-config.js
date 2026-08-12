const fs = require('fs');
const path = require('path');

// 1. If a local .env file exists, read and load it into process.env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valParts] = trimmed.split('=');
      if (key && valParts.length > 0) {
        const envKey = key.trim();
        const envVal = valParts.join('=').trim().replace(/^["']|["']$/g, '');
        process.env[envKey] = envVal;
      }
    }
  });
  console.log('📝 Loaded configuration variables from local .env file.');
} else {
  console.log('ℹ️ No local .env file found. Using system environment variables (production mode).');
}

// 2. Map from process.env (system or .env loaded) to the firebase config
const configContent = `// Generated automatically by generate-config.js. Do not commit.
window.firebaseConfig = {
  apiKey: "${process.env.FIREBASE_API_KEY || ''}",
  authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || ''}",
  projectId: "${process.env.FIREBASE_PROJECT_ID || ''}",
  storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || ''}",
  messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}",
  appId: "${process.env.FIREBASE_APP_ID || ''}",
  measurementId: "${process.env.FIREBASE_MEASUREMENT_ID || ''}",
  adminPassword: "${process.env.ADMIN_PASSWORD || ''}",
  adminEmail: "${process.env.ADMIN_EMAIL || ''}"
};
`;

const configDir = path.join(__dirname, 'config');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir);
}

fs.writeFileSync(path.join(configDir, 'firebase-config.js'), configContent, 'utf8');
console.log(' Generated config/firebase-config.js successfully.');
