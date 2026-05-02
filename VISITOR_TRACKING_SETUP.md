# Vercel KV Setup Guide

## Real Visitor Tracking Implementation

Your app now uses **Vercel KV** (Redis) for real visitor tracking instead of mock data.

### Setup Instructions

#### 1. **Create Vercel KV Database**
   - Go to https://vercel.com/dashboard
   - Click **Storage** in the top menu
   - Click **Create** → Select **KV**
   - Choose a region closest to you
   - Copy the connection strings (you'll see environment variables)

#### 2. **Add Environment Variables**
   In your Vercel project settings:
   - Go to **Settings** → **Environment Variables**
   - Add these variables from your KV setup:
     - `KV_URL`
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
     - `KV_REST_API_READ_ONLY_TOKEN`

   Or if you're deploying through Vercel UI, it should auto-link when you add KV storage.

#### 3. **Install Dependency (Local Development)**
   ```bash
   npm install @vercel/kv
   ```

#### 4. **Local Development**
   For testing locally, create a `.env.local` file in your root with:
   ```
   KV_URL=<your-kv-url>
   KV_REST_API_URL=<your-rest-api-url>
   KV_REST_API_TOKEN=<your-api-token>
   ```

### How It Works

**Visitor Tracking:**
- On each page load, a POST request is sent to `/api/visitors/count`
- The API captures the visitor's IP address
- **Total visitors**: Incremented with each visit
- **Today's visitors**: Counted as unique IPs per day (resets at midnight UTC)
- Data persists in Vercel KV (Redis)

**Benefits:**
✅ Real visitor data persists across deployments  
✅ Unique visitor tracking per day  
✅ No database setup needed (fully managed)  
✅ Auto-scales with Vercel  
✅ Free tier includes KV storage  

### Testing

Once deployed:
1. Each page load increments the total count
2. Unique IPs are counted as one per day
3. Daily count resets at midnight UTC
4. Data persists permanently

### Troubleshooting

If visitor counts show 0:
1. Check KV is linked in Vercel project
2. Verify environment variables are set correctly
3. Check API route is accessible: `/api/visitors/count`
4. Look at Vercel function logs for errors

### Alternative: Database Options

If you prefer a different database:
- **MongoDB**: Use `mongodb` npm package
- **PostgreSQL**: Use `pg` or `prisma`
- **Supabase**: PostgreSQL with easy Vercel integration
- **Firebase**: Real-time database

Contact me if you want to switch databases!
