# Deployment Checklist

Use this checklist to ensure everything is ready for deployment.

## Pre-Deployment

### Frontend
- [x] `vercel.json` created
- [x] `vite.config.ts` updated for production
- [x] Environment variables use `VITE_` prefix
- [x] Build command works locally (`npm run build`)
- [x] `.vercelignore` created

### Backend
- [ ] ML models trained (`*.pkl` files exist)
- [ ] `requirements.txt` is up to date
- [ ] Environment variables documented
- [ ] CORS settings allow Vercel domain
- [ ] Database migrations ready (if any)

### Code
- [ ] All code committed to Git
- [ ] No hardcoded localhost URLs
- [ ] Error handling in place
- [ ] Logging configured

## Deployment Steps

### 1. Frontend (Vercel)
- [ ] Vercel account created
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Logged in (`vercel login`)
- [ ] Deployed (`vercel --prod`)
- [ ] Environment variable `VITE_API_URL` set
- [ ] Tested production URL

### 2. Backend (Railway/Render/Fly.io)
- [ ] Account created
- [ ] Project created
- [ ] PostgreSQL service added
- [ ] Redis service added
- [ ] Backend service deployed
- [ ] Environment variables set:
  - [ ] `DATABASE_URL`
  - [ ] `REDIS_URL`
- [ ] Backend URL obtained
- [ ] Health check endpoint works

### 3. Database Setup
- [ ] PostgreSQL database created
- [ ] Connection string obtained
- [ ] Tables created (auto on first run)
- [ ] ML models accessible

### 4. Redis Setup
- [ ] Redis instance created
- [ ] Connection URL obtained
- [ ] Tested connection

### 5. Configuration
- [ ] `VITE_API_URL` in Vercel points to backend
- [ ] Backend CORS allows Vercel domain
- [ ] WebSocket fallback tested (polling works)

## Post-Deployment Testing

- [ ] Frontend loads correctly
- [ ] API calls work
- [ ] Transactions can be created
- [ ] Fraud detection works
- [ ] Real-time updates work (polling)
- [ ] Analytics charts load
- [ ] No console errors
- [ ] Mobile responsive

## Monitoring

- [ ] Error tracking set up (optional)
- [ ] Analytics enabled (Vercel Analytics)
- [ ] Uptime monitoring (optional)
- [ ] Log aggregation (optional)

## Documentation

- [ ] Deployment guide created
- [ ] Environment variables documented
- [ ] Troubleshooting guide ready
- [ ] Team access configured

