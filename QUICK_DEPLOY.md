# Quick Deploy to Vercel - 5 Minutes

## Prerequisites
- Vercel account (free): https://vercel.com/signup
- Node.js installed
- Your project in a Git repository (GitHub/GitLab/Bitbucket)

## Deploy Frontend (3 steps)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
cd frontend
vercel login
```

### Step 3: Deploy
```bash
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Yes**
- Link to existing project? **No**
- Project name? **fraud-detection-frontend**
- Directory? **`./`**

## Set Environment Variable

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.com` (set after backend deployment)
   - **Environment**: All (Production, Preview, Development)
5. Click **Save**
6. Redeploy: `vercel --prod`

## That's It! 🎉

Your frontend is now live at: `https://your-project.vercel.app`

## Next: Deploy Backend

See `VERCEL_DEPLOYMENT.md` for backend deployment options (Railway, Render, or Fly.io).

## Troubleshooting

**Build fails?**
- Check logs: `vercel logs`
- Ensure `npm run build` works locally

**API not connecting?**
- Verify `VITE_API_URL` is set correctly
- Check backend CORS settings
- Ensure backend is deployed

**Need help?**
- See `VERCEL_DEPLOYMENT.md` for detailed guide
- Vercel docs: https://vercel.com/docs

