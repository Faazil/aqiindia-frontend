import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      // Track a visitor
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-real-ip'] || req.socket.remoteAddress || 'unknown';
      const today = new Date().toISOString().split('T')[0];
      
      // Increment total visitors
      const total = await kv.incr('visitors:total');
      
      // Track today's visitors (unique per IP per day)
      const ipKey = `visitors:today:${today}:${ip}`;
      const isNewToday = await kv.set(ipKey, 1, { nx: true, ex: 86400 }); // Expire after 24h
      
      // Count unique visitors today
      let todayCount = parseInt(await kv.get(`visitors:today:count:${today}`) || '0');
      if (isNewToday) {
        todayCount += 1;
        await kv.set(`visitors:today:count:${today}`, todayCount, { ex: 86400 });
      } else {
        todayCount = parseInt(await kv.get(`visitors:today:count:${today}`) || '0');
      }

      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).json({
        total,
        today: todayCount,
        lastUpdated: new Date().toISOString()
      });
    }

    if (req.method === 'GET') {
      // Get current visitor stats
      const today = new Date().toISOString().split('T')[0];
      const total = parseInt(await kv.get('visitors:total') || '0');
      const todayCount = parseInt(await kv.get(`visitors:today:count:${today}`) || '0');

      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).json({
        total,
        today: todayCount,
        lastUpdated: new Date().toISOString()
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Visitor tracking error:', error);
    // Fallback to safe defaults if KV is not available
    res.status(200).json({
      total: 0,
      today: 0,
      lastUpdated: new Date().toISOString()
    });
  }
}
