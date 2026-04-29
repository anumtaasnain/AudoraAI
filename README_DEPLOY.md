# Deployment Plan: Audora AI

This document outlines the steps to deploy the Audora AI platform to GitHub and Vercel.

## 1. GitHub Repository
I have already initialized a Git repository locally and committed all current changes. To make it live on GitHub:
1. Create a new repository on GitHub named `audora-ai`.
2. Run the following commands in your terminal:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/audora-ai.git
   git branch -M main
   git push -u origin main
   ```

## 2. Backend Deployment (Vercel)
The backend is configured to run as a Vercel Serverless Function.
1. Go to [Vercel](https://vercel.com).
2. Create a **New Project** and import the `audora-ai` repository.
3. In the "Project Settings":
   - Set **Root Directory** to `backend`.
   - Add the following **Environment Variables** (from your `backend/.env`):
     - `MONGODB_URI`: Your MongoDB Atlas connection string.
     - `JWT_ACCESS_SECRET`: A secure random string.
     - `JWT_REFRESH_SECRET`: A secure random string.
     - `GEMINI_API_KEY`: Your Google Gemini API key.
     - `PORT`: `5000`
     - `NODE_ENV`: `production`.
4. Deploy. You will get a URL like `https://audora-ai-api.vercel.app`.

## 3. Frontend Deployment (Vercel)
Deploy the frontend as a separate project on Vercel.
1. Create another **New Project** on Vercel and import the same repository.
2. In the "Project Settings":
   - Set **Root Directory** to `./` (the root).
   - Add the following **Environment Variable**:
     - `VITE_API_URL`: The URL of your deployed backend (e.g., `https://audora-ai-api.vercel.app/api/v1`).
3. Deploy. Your frontend will be live!

## 4. Final Updates
Once the backend is live:
1. Update any hardcoded local URLs if they exist.
2. Ensure the MongoDB Atlas IP Whitelist allows access from all IPs (`0.0.0.0/0`) since Vercel uses dynamic IPs.
