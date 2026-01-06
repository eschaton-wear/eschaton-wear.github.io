# Deploying Léger AI

Léger AI is production-ready. Follow these steps to deploy it to the public web for free.

## Prerequisite: GitHub
1. Create a new repository on [GitHub.com](https://github.com/new) named `leger-ai`.
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   # Replace <your-username> below
   git remote add origin https://github.com/<your-username>/leger-ai.git
   git push -u origin main
   ```

## Option A: Vercel (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your `leger-ai` repository.
3. **Environment Variables**:
   Add the following keys in the "Environment Variables" section:
   - `NEXT_PUBLIC_SUPABASE_URL` (from your Supabase dashboard)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from your Supabase dashboard)
   - `OPENROUTER_API_KEY` (Optional: for Real AI)
4. Click **Deploy**.

## Option B: Netlify
1. Go to [netlify.com](https://www.netlify.com/).
2. "Import from Git" -> Choose GitHub -> `leger-ai`.
3. Set "Build Command" to `npm run build`.
4. Set "Publish Directory" to `.next`.
5. Add Environment Variables in "Site Settings" -> "Environment".
6. Click **Deploy Site**.

## Verification
Once deployed, Vercel/Netlify will give you a public URL (e.g., `https://leger-ai.vercel.app`).
- Visit the link.
- Check the "Platform is Live" badge.
- Test the Chat and Pricing pages.
