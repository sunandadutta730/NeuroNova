# What We Changed and Why

Here is a simple developer-to-developer log of the changes we made to get the project working cleanly and securely.

---

## 1. The Changes

### Fix for the Google Login Crash
- **What was happening**: Users logging in with Google for the first time were getting a console crash because Google accounts do not always have a phone number. The code was passing `undefined` for the phone field to Firestore, which rejected it.
- **The fix**: We added fallback checks to default to an empty string `""` if the phone number is missing, and switched to merging the user document instead of adding duplicates.

### Moving Secrets to .env
- **What was happening**: The Firebase project keys and admin credentials were hardcoded directly in the JavaScript config files, which meant they would get leaked to GitHub on your next push.
- **The fix**: We moved all these sensitive keys into a local `.env` file (which is gitignored). We then wrote a small helper script (`generate-config.js`) that automatically reads these variables and builds the configuration file (`config/firebase-config.js`) dynamically when you run the project.

### Admin Stock Count Bug
- **What was happening**: In the admin panel, clicking `+10` or `-10` adjusted the total stock units count in the database, but it did not update the counts of the individual blood types (like O+, A-). This broke the database math.
- **The fix**: We updated the update logic so that adding/subtracting stock dynamically updates the individual blood groups (like O+) along with the total count.

### Firestore Rules Security
- **What was happening**: The default security rules allowed anyone (even unauthenticated clients) to edit and delete critical data across the collections.
- **The fix**: Restricted write permissions so that users can only modify their own profiles and closed write access on dispatches, inventory, and requests to authenticated sessions.

### Input Limits and Validations
- **What was happening**: The forms had loose validation. Names could be a single word (missing last name), passwords lacked strength meters, phone numbers weren't strictly limited to 10-digit formats, and dates of last donation could be set to arbitrary values (e.g. `1/1/0001` or in the future) with no age validation for donors.
- **The fix**: 
  - Restructured input limits to block typing non-numbers in phone inputs and require exactly 10 digits.
  - Enforced name formats to require at least a first name and a last name (two parts separated by a space).
  - Added a password strength indicator showing (Weak, Medium, Strong) as you type, and prevented signing up with weak passwords.
  - Linked the database setup to `config/firebase-config.js` properly so the `.env` admin credentials load at runtime.
  - Added an Age field to donor registration (restricted between 18 and 60 years) and blocked future or absurd past dates for the last donation date.

---

## 2. Preventing Git Secret Leaks

Since the database configuration file was previously tracked by Git, we need to untrack it so Git ignores it going forward. Run these commands in your project root terminal:

1. Tell Git to stop tracking the config file (this does not delete it from your computer):
   ```bash
   git rm --cached config/firebase-config.js
   ```

2. Commit the untracked file deletion:
   ```bash
   git commit -m "untrack firebase-config.js to prevent credentials leak"
   ```

3. Push the change to GitHub:
   ```bash
   git push origin main
   ```

Now, your local Firebase configuration file will stay ignored, and you will not leak credentials to your public repository.
