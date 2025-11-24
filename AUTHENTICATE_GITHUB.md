# Fix GitHub Authentication

GitHub doesn't accept passwords anymore. You need a **Personal Access Token**.

## Option 1: Create Personal Access Token (Recommended)

1. **Go to GitHub Settings**:
   - https://github.com/settings/tokens
   - Or: GitHub → Your Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Click "Generate new token" → "Generate new token (classic)"**

3. **Fill in the form**:
   - Note: "Trackviso push token"
   - Expiration: Choose how long (90 days, 1 year, etc.)
   - **Check "repo"** (this gives access to repositories)
   - Click "Generate token"

4. **Copy the token immediately** (you won't see it again!)

5. **Use it as your password** when pushing:
   ```bash
   git push -u origin main
   ```
   - Username: `dkhedekar79`
   - Password: **Paste your token here** (not your GitHub password!)

---

## Option 2: Use SSH Instead

1. **Check if you have SSH key**:
   ```bash
   ls -la ~/.ssh
   ```

2. **If no SSH key, create one**:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
   (Press Enter to accept defaults, set a passphrase if you want)

3. **Add SSH key to GitHub**:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Copy the output, then:
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste the key
   - Save

4. **Change remote to SSH**:
   ```bash
   git remote set-url origin git@github.com:dkhedekar79/Trackviso2.git
   ```

5. **Push again**:
   ```bash
   git push -u origin main
   ```

---

## Quick Solution (Easiest)

**Just create a token and use it:**

1. Go to: https://github.com/settings/tokens/new
2. Name: "Trackviso"
3. Check "repo"
4. Generate token
5. Copy it
6. Run: `git push -u origin main`
7. Username: `dkhedekar79`
8. Password: **paste your token**

That's it! 🚀
