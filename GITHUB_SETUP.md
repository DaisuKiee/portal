# Push to GitHub - Step by Step Guide

## Prerequisites
- Git installed on your computer
- GitHub account created
- Repository created on GitHub (or will create one)

## Step 1: Initialize Git Repository (if not already done)

```bash
# Navigate to your project root
cd C:\Programming\admissionanti

# Initialize git (skip if already initialized)
git init

# Check git status
git status
```

## Step 2: Configure Git (First Time Only)

```bash
# Set your name
git config --global user.name "Your Name"

# Set your email (use your GitHub email)
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

## Step 3: Create Repository on GitHub

1. Go to https://github.com
2. Click the "+" icon (top right) → "New repository"
3. Repository name: `ctu-admission-portal` (or your preferred name)
4. Description: "AI-Integrated Mobile-Based CTU Admission Portal"
5. Choose: **Private** (recommended) or Public
6. **DO NOT** initialize with README (we already have one)
7. Click "Create repository"

## Step 4: Add Files to Git

```bash
# Add all files (respects .gitignore)
git add .

# Check what will be committed
git status

# Commit with message
git commit -m "Initial commit: CTU Admission Portal with AI integration"
```

## Step 5: Connect to GitHub Repository

Replace `YOUR_USERNAME` and `REPO_NAME` with your actual values:

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Verify remote
git remote -v
```

## Step 6: Push to GitHub

```bash
# Push to main branch
git push -u origin main

# If you get an error about 'master' branch, try:
git branch -M main
git push -u origin main
```

## Step 7: Verify on GitHub

1. Go to your GitHub repository URL
2. Refresh the page
3. You should see all your files uploaded

## Common Issues & Solutions

### Issue 1: Authentication Failed
**Solution**: Use Personal Access Token instead of password

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Select scopes: `repo` (full control)
4. Copy the token
5. When pushing, use token as password

### Issue 2: Branch name is 'master' not 'main'
```bash
git branch -M main
git push -u origin main
```

### Issue 3: Remote already exists
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### Issue 4: Large files error
```bash
# Remove large files from git cache
git rm --cached mobile/node_modules -r
git rm --cached backend/node_modules -r
git commit -m "Remove node_modules"
git push
```

## Future Updates

After initial push, to update your repository:

```bash
# Check status
git status

# Add changes
git add .

# Commit with descriptive message
git commit -m "Add forgot password feature"

# Push to GitHub
git push
```

## Quick Commands Reference

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your message here"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log --oneline

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

## Important Notes

✅ **Included in repository:**
- Source code (mobile & backend)
- README.md with documentation
- Configuration examples (.env.example)
- Build guides and documentation

❌ **Excluded from repository (via .gitignore):**
- node_modules/
- .env files (sensitive data)
- Build outputs (.apk, .aab)
- IDE settings
- Logs and temporary files

## Security Reminders

⚠️ **NEVER commit:**
- `.env` files with real credentials
- API keys or secrets
- Database passwords
- Email passwords
- JWT secrets

✅ **Always use:**
- `.env.example` files (with placeholder values)
- Environment variables for sensitive data
- `.gitignore` to exclude sensitive files

## Repository Structure on GitHub

```
ctu-admission-portal/
├── .gitignore
├── README.md
├── GITHUB_SETUP.md
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   └── ...
├── mobile/
│   ├── package.json
│   ├── App.js
│   └── ...
└── documentation files
```

## Next Steps After Pushing

1. Add repository description on GitHub
2. Add topics/tags: `react-native`, `nodejs`, `mongodb`, `admission-system`, `ai`
3. Create a LICENSE file if needed
4. Add collaborators if working in a team
5. Set up GitHub Actions for CI/CD (optional)
6. Enable GitHub Pages for documentation (optional)

## Collaboration

To allow others to contribute:

1. Go to repository Settings → Collaborators
2. Add collaborators by username/email
3. They can clone: `git clone https://github.com/YOUR_USERNAME/REPO_NAME.git`

---

**Need Help?**
- GitHub Docs: https://docs.github.com
- Git Docs: https://git-scm.com/doc
