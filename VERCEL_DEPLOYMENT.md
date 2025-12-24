# Vercel Deployment Guide

This guide will help you deploy the Fraud Detection System frontend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com (free)
2. **Node.js**: Installed on your machine (for Vercel CLI)
3. **Git**: Your project should be in a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

Or use npx (no installation needed):
```bash
npx vercel
```

## Step 2: Prepare Your Project

The project is already configured with:
- ✅ `vercel.json` - Vercel configuration
- ✅ `vite.config.ts` - Production build settings
- ✅ Environment variable support

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```
   This will open your browser for authentication.

3. **Deploy (first time):**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - Project name? **fraud-detection-frontend** (or your choice)
   - Directory? **`./`** (current directory)
   - Override settings? **No**

4. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Option B: Using Vercel Dashboard (Git Integration)

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **Deploy**

## Step 4: Configure Environment Variables

After deployment, you need to set the backend API URL:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add the following variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.com` (your backend API URL)
   - **Environment**: Production, Preview, Development (select all)

3. **Redeploy** after adding environment variables:
   ```bash
   vercel --prod
   ```
   Or trigger a new deployment from the Vercel dashboard.

## Step 5: Backend Deployment (Required)

The frontend needs a backend API. You have several options:

### Option A: Railway (Recommended)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Add services:
   - **PostgreSQL** (from marketplace)
   - **Redis** (from marketplace)
   - **Backend** (add service, select backend folder)
6. Set environment variables in Railway:
   ```
   DATABASE_URL=<railway-postgres-url>
   REDIS_URL=<railway-redis-url>
   ```
7. Deploy and get your backend URL
8. Update `VITE_API_URL` in Vercel with Railway backend URL

### Option B: Render

1. Go to https://render.com
2. Sign up with GitHub
3. **New** → **Web Service**
4. Connect your repository
5. Configure:
   - **Name**: fraud-detection-backend
   - **Environment**: Python 3
   - **Build Command**: `cd backend && pip install -r requirements.txt && python -m app.models.train_models`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`
6. Add **PostgreSQL** and **Redis** from marketplace
7. Set environment variables
8. Deploy and update `VITE_API_URL` in Vercel

### Option C: Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. In backend directory: `fly launch`
4. Add PostgreSQL: `fly postgres create`
5. Add Redis: `fly redis create`
6. Deploy: `fly deploy`

## Step 6: Database Setup

### PostgreSQL Options:
- **Supabase** (Free tier): https://supabase.com
- **Neon** (Free tier): https://neon.tech
- **Railway/Render** (Auto-provisioned)

### Redis Options:
- **Upstash** (Serverless, Free tier): https://upstash.com
- **Redis Cloud** (Free tier): https://redis.com/cloud
- **Railway/Render** (Auto-provisioned)

## Step 7: Update CORS Settings

After deploying backend, update CORS in `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://your-vercel-app.vercel.app",  # Add your Vercel URL
        "https://*.vercel.app"  # Allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Step 8: Train ML Models

Before deploying backend, ensure ML models are trained:

```bash
cd backend
python -m app.models.train_models
```

Commit the trained models (`*.pkl` files) to your repository, or train them during deployment.

## Important Notes

### WebSocket Limitation
Vercel doesn't support WebSocket connections. The frontend will automatically fall back to polling (updates every 5 seconds) when WebSocket fails.

### Environment Variables
- Frontend: Set in Vercel Dashboard
- Backend: Set in Railway/Render/Fly.io dashboard

### Build Time
- First deployment may take 3-5 minutes
- Subsequent deployments are faster (1-2 minutes)

### Custom Domain
1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify `vercel.json` configuration

### API Connection Errors
- Verify `VITE_API_URL` is set correctly
- Check backend CORS settings
- Ensure backend is deployed and running

### Environment Variables Not Working
- Redeploy after adding variables
- Check variable names (must start with `VITE_` for Vite)
- Verify environment scope (Production/Preview/Development)

### 404 Errors on Refresh
- This is handled by `vercel.json` rewrites
- If issues persist, check SPA routing configuration

## Quick Deployment Checklist

- [ ] Vercel account created
- [ ] Vercel CLI installed
- [ ] Project deployed to Vercel
- [ ] Environment variable `VITE_API_URL` set
- [ ] Backend deployed (Railway/Render/Fly.io)
- [ ] Database and Redis configured
- [ ] CORS updated in backend
- [ ] ML models trained and committed
- [ ] Test deployment works

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs

## Next Steps After Deployment

1. Test all features on production URL
2. Set up monitoring (Vercel Analytics)
3. Configure custom domain (optional)
4. Set up CI/CD for automatic deployments
5. Add error tracking (Sentry, etc.)

