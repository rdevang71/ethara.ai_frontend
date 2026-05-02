Deployment steps (Frontend - Vercel)

1. Project root
   - In Vercel Project Settings -> General, set **Root Directory** to `frontend`.

2. Build & Output
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. Environment Variables (Production)
   - Add `VITE_API_URL=https://ethara-ai-backend-gxo6.onrender.com`

4. Ensure Node version (optional)
   - In Project Settings -> General -> Environment, set Node Version to `18.x` if needed, or add `engines` in `package.json`.

5. Redeploy
   - Trigger a redeploy in Vercel or push a commit to `main`.

Notes
 - The frontend expects API calls like `api.post('/auth/login')` (no `/api` prefix) because `VITE_API_URL` is normalized to include `/api`.
 - If build fails with `.bin` permission issues, the `build` script already uses `node node_modules/vite/bin/vite.js build` to avoid that.
