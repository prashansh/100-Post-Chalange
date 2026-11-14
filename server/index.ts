import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Extend express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId || userId.trim() === '') {
    return res.status(401).json({ error: 'Unauthorized: missing x-user-id header' });
  }
  req.userId = userId.trim();
  next();
};

// ─── DEFAULT 100 POSTS GENERATOR ─────────────────────────────────────────────
const DEFAULT_MILESTONES = [
  { day: 5, rewardTitle: 'Special Coffee & Treat ☕', isUnlocked: 0, rewardNote: 'Celebrate hitting the first 5 posts!' },
  { day: 10, rewardTitle: 'Upgrade Studio Lighting / Softbox 💡', isUnlocked: 0, rewardNote: 'Reward for hitting double digits!' },
  { day: 15, rewardTitle: 'Buy High-End Wireless Lavalier Mic 🎙️', isUnlocked: 0, rewardNote: 'Level up your audio quality' },
  { day: 30, rewardTitle: 'Fancy Dinner + 1 Full Day Offline Break 🍽️', isUnlocked: 0, rewardNote: 'Surviving 1 full month of consistency!' },
  { day: 50, rewardTitle: 'Weekend Getaway / Creator Retreat 🏕️', isUnlocked: 0, rewardNote: 'Halfway mark conquered!' },
  { day: 75, rewardTitle: 'Hire Video Editor / Thumbnail Designer 🎨', isUnlocked: 0, rewardNote: 'Time to scale the pipeline' },
  { day: 100, rewardTitle: '🏆 Launch Your Own Digital Product / Celebrate!', isUnlocked: 0, rewardNote: 'The ultimate milestone — you did it!' },
];

function seedUserDefaultPosts(userId: string, startDateStr?: string) {
  const baseDate = startDateStr ? new Date(startDateStr) : new Date();
  baseDate.setHours(10, 0, 0, 0);

  const milestoneDays = [5, 10, 15, 30, 50, 75, 100];

  const insertPostStmt = db.prepare(`
    INSERT OR IGNORE INTO posts (
      userId, day, title, status, category, idea, targetAudience,
      visualHook, spokenHook, textOverlayHook, script, bulletPoints,
      cta, format, visualNotes, shotList, thumbnailConcept,
      publishDateETA, publishedAt, platform, secondaryPlatforms,
      liveUrl, views, likes, comments, shares, notes,
      isMilestone, milestoneReward, updatedAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  for (let i = 1; i <= 100; i++) {
    const postDate = new Date(baseDate);
    postDate.setDate(baseDate.getDate() + (i - 1));
    const isoDate = postDate.toISOString().slice(0, 16);

    const isMilestone = milestoneDays.includes(i) ? 1 : 0;
    const milestoneObj = DEFAULT_MILESTONES.find((m) => m.day === i);

    if (i === 1) {
      // Day 1: Rich Published Example
      insertPostStmt.run(
        userId,
        1,
        'Day 1: The 3-App Stack That Saved Me 15 Hours a Week',
        'published',
        'Productivity & Tech',
        'Show the minimalist creator app stack that automates clip cutting, transcription, and scheduling so solo creators can batch 3 videos in 60 minutes.',
        'Solo creators, indie hackers, and online entrepreneurs looking to build consistency without burning out.',
        'Rapid split-screen: cluttered messy desktop vs. clean Notion + Whisper workflow — with a dramatic swoosh sound effect.',
        'I wasted 15 hours last week doing this manually — until I found these 3 tools that now run my entire content pipeline.',
        'Stop editing Shorts manually in 2026 🛑',
        `Here is the exact 3-app stack saving me 15 hours every single week as a solo creator:

Tool 1: Riverside.fm — Studio-grade multi-track audio and instant auto-transcription.
Tool 2: Notion Creator OS — Track hooks, retention notes, and ideas in one clean dashboard.
Tool 3: OpusClip or Descript — Auto-cut dead air and generate animated captions in seconds.

If you're doing this solo, your system is your only unfair advantage.
Comment "STACK" below and I'll send you my Notion template for free!`,
        JSON.stringify([
          'Problem: Solo creators burn hours on manual editing',
          'Tool 1: Riverside — audio capture + auto-transcription',
          'Tool 2: Notion Creator OS — the content pipeline hub',
          'Tool 3: OpusClip/Descript — auto-cut + captions',
          'CTA: comment "STACK" for free Notion template',
        ]),
        'Comment "STACK" for the free workflow Notion template.',
        'short_video',
        'Ring light + Sony ZV-E10, 4K 24fps, 16mm f/1.4. Clean desk aesthetic with warm LED background.',
        JSON.stringify([
          { id: '1', text: 'Talking-head A-Roll intro (0–15s)', done: true },
          { id: '2', text: 'Screen-capture B-Roll of each app UI', done: true },
          { id: '3', text: 'Text callouts + woosh/pop sound effects', done: true },
          { id: '4', text: 'Outro with CTA graphic banner', done: true },
        ]),
        'Bold high-contrast portrait left, 3-word yellow headline right with drop shadow.',
        isoDate,
        new Date().toISOString(),
        'instagram',
        JSON.stringify(['youtube', 'tiktok']),
        '',
        24300,
        1870,
        143,
        412,
        'Hook performed exceptionally — 81% watch-through on Reels. "STACK" CTA drove 340 DMs.',
        0,
        '',
        new Date().toISOString()
      );
    } else {
      // Days 2 to 100: Blank template ready for user
      insertPostStmt.run(
        userId,
        i,
        `Day ${i}: Your post title`,
        'draft',
        'Uncategorized',
        '',
        '',
        '',
        '',
        '',
        '',
        JSON.stringify([]),
        '',
        'short_video',
        '',
        JSON.stringify([
          { id: '1', text: 'Talking-head A-Roll intro', done: false },
          { id: '2', text: 'B-Roll footage', done: false },
          { id: '3', text: 'Text overlays & captions', done: false },
          { id: '4', text: 'Outro with CTA', done: false },
        ]),
        '',
        isoDate,
        '',
        'instagram',
        JSON.stringify([]),
        '',
        0,
        0,
        0,
        0,
        '',
        isMilestone,
        milestoneObj?.rewardTitle || '',
        new Date().toISOString()
      );
    }
  }

  // Seed default milestones
  const insertMilestoneStmt = db.prepare(`
    INSERT OR IGNORE INTO milestones (userId, day, rewardTitle, isUnlocked, rewardNote)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const m of DEFAULT_MILESTONES) {
    insertMilestoneStmt.run(userId, m.day, m.rewardTitle, m.isUnlocked, m.rewardNote);
  }
}

// ─── API ROUTES ───────────────────────────────────────────────────────────────

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Creator Toolkit API Backend',
    timestamp: new Date().toISOString(),
    database: 'SQLite (WAL Mode)',
  });
});

// 2. Sync / Upsert User Profile
app.post('/api/user/sync', requireAuth, (req, res) => {
  const userId = req.userId!;
  const {
    email = '',
    displayName = '',
    photoURL = '',
    creatorHandle = '',
    country = '',
    dateOfBirth = '',
    niche = '',
    challengeStartDate = new Date().toISOString().slice(0, 10),
  } = req.body;

  const now = new Date().toISOString();

  // Check if user already exists
  const checkUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);

  if (checkUser) {
    db.prepare(`
      UPDATE users SET
        email = COALESCE(NULLIF(?, ''), email),
        displayName = COALESCE(NULLIF(?, ''), displayName),
        photoURL = COALESCE(NULLIF(?, ''), photoURL),
        creatorHandle = COALESCE(NULLIF(?, ''), creatorHandle),
        country = COALESCE(NULLIF(?, ''), country),
        dateOfBirth = COALESCE(NULLIF(?, ''), dateOfBirth),
        niche = COALESCE(NULLIF(?, ''), niche),
        challengeStartDate = COALESCE(NULLIF(?, ''), challengeStartDate),
        updatedAt = ?
      WHERE id = ?
    `).run(
      email, displayName, photoURL, creatorHandle, country,
      dateOfBirth, niche, challengeStartDate, now, userId
    );
  } else {
    db.prepare(`
      INSERT INTO users (
        id, email, displayName, photoURL, creatorHandle,
        country, dateOfBirth, niche, challengeStartDate,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId, email, displayName, photoURL, creatorHandle,
      country, dateOfBirth, niche, challengeStartDate, now, now
    );

    // Seed initial posts for this new user!
    seedUserDefaultPosts(userId, challengeStartDate);
  }

  const updatedProfile = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  res.json({ success: true, profile: updatedProfile });
});

// 3. Get User Profile
app.get('/api/user/profile', requireAuth, (req, res) => {
  const userId = req.userId!;
  const profile = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  if (!profile) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  res.json(profile);
});

// 4. Update User Profile
app.put('/api/user/profile', requireAuth, (req, res) => {
  const userId = req.userId!;
  const { creatorHandle, displayName, niche, country } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE users SET
      creatorHandle = COALESCE(?, creatorHandle),
      displayName = COALESCE(?, displayName),
      niche = COALESCE(?, niche),
      country = COALESCE(?, country),
      updatedAt = ?
    WHERE id = ?
  `).run(creatorHandle, displayName, niche, country, now, userId);

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  res.json({ success: true, profile: updated });
});

// 5. Get All 100 Posts for User
app.get('/api/posts', requireAuth, (req, res) => {
  const userId = req.userId!;

  // Check if posts exist for this user; if not, seed them
  const countObj = db.prepare('SELECT COUNT(*) as count FROM posts WHERE userId = ?').get(userId) as { count: number };
  if (countObj.count < 100) {
    const userProfile = db.prepare('SELECT challengeStartDate FROM users WHERE id = ?').get(userId) as any;
    seedUserDefaultPosts(userId, userProfile?.challengeStartDate);
  }

  const rows = db.prepare('SELECT * FROM posts WHERE userId = ? ORDER BY day ASC').all(userId) as any[];

  // Format JSON fields back to objects
  const posts = rows.map((r) => ({
    day: r.day,
    title: r.title,
    status: r.status,
    category: r.category,
    idea: r.idea,
    targetAudience: r.targetAudience,
    visualHook: r.visualHook,
    spokenHook: r.spokenHook,
    textOverlayHook: r.textOverlayHook,
    script: r.script,
    bulletPoints: r.bulletPoints ? JSON.parse(r.bulletPoints) : [],
    cta: r.cta,
    format: r.format,
    visualNotes: r.visualNotes,
    shotList: r.shotList ? JSON.parse(r.shotList) : [],
    thumbnailConcept: r.thumbnailConcept,
    publishDateETA: r.publishDateETA,
    publishedAt: r.publishedAt || undefined,
    platform: r.platform,
    secondaryPlatforms: r.secondaryPlatforms ? JSON.parse(r.secondaryPlatforms) : [],
    liveUrl: r.liveUrl || '',
    views: r.views || 0,
    likes: r.likes || 0,
    comments: r.comments || 0,
    shares: r.shares || 0,
    notes: r.notes || '',
    isMilestone: Boolean(r.isMilestone),
    milestoneReward: r.milestoneReward || undefined,
  }));

  res.json({ posts, count: posts.length });
});

// 6. Update Single Post (Day 1..100)
app.put('/api/posts/:day', requireAuth, (req, res) => {
  const userId = req.userId!;
  const day = parseInt(req.params.day, 10);
  const p = req.body;
  const now = new Date().toISOString();

  if (isNaN(day) || day < 1 || day > 100) {
    return res.status(400).json({ error: 'Invalid day number (must be 1-100)' });
  }

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO posts (
      userId, day, title, status, category, idea, targetAudience,
      visualHook, spokenHook, textOverlayHook, script, bulletPoints,
      cta, format, visualNotes, shotList, thumbnailConcept,
      publishDateETA, publishedAt, platform, secondaryPlatforms,
      liveUrl, views, likes, comments, shares, notes,
      isMilestone, milestoneReward, updatedAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  stmt.run(
    userId,
    day,
    p.title || `Day ${day}: Untitled`,
    p.status || 'draft',
    p.category || 'Uncategorized',
    p.idea || '',
    p.targetAudience || '',
    p.visualHook || '',
    p.spokenHook || '',
    p.textOverlayHook || '',
    p.script || '',
    JSON.stringify(p.bulletPoints || []),
    p.cta || '',
    p.format || 'short_video',
    p.visualNotes || '',
    JSON.stringify(p.shotList || []),
    p.thumbnailConcept || '',
    p.publishDateETA || now,
    p.publishedAt || '',
    p.platform || 'instagram',
    JSON.stringify(p.secondaryPlatforms || []),
    p.liveUrl || '',
    p.views || 0,
    p.likes || 0,
    p.comments || 0,
    p.shares || 0,
    p.notes || '',
    p.isMilestone ? 1 : 0,
    p.milestoneReward || '',
    now
  );

  res.json({ success: true, day });
});

// 7. Batch Save Posts
app.post('/api/posts/batch', requireAuth, (req, res) => {
  const userId = req.userId!;
  const { posts } = req.body;

  if (!Array.isArray(posts)) {
    return res.status(400).json({ error: 'posts must be an array' });
  }

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO posts (
      userId, day, title, status, category, idea, targetAudience,
      visualHook, spokenHook, textOverlayHook, script, bulletPoints,
      cta, format, visualNotes, shotList, thumbnailConcept,
      publishDateETA, publishedAt, platform, secondaryPlatforms,
      liveUrl, views, likes, comments, shares, notes,
      isMilestone, milestoneReward, updatedAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  for (const p of posts) {
    stmt.run(
      userId,
      p.day,
      p.title || `Day ${p.day}: Untitled`,
      p.status || 'draft',
      p.category || 'Uncategorized',
      p.idea || '',
      p.targetAudience || '',
      p.visualHook || '',
      p.spokenHook || '',
      p.textOverlayHook || '',
      p.script || '',
      JSON.stringify(p.bulletPoints || []),
      p.cta || '',
      p.format || 'short_video',
      p.visualNotes || '',
      JSON.stringify(p.shotList || []),
      p.thumbnailConcept || '',
      p.publishDateETA || now,
      p.publishedAt || '',
      p.platform || 'instagram',
      JSON.stringify(p.secondaryPlatforms || []),
      p.liveUrl || '',
      p.views || 0,
      p.likes || 0,
      p.comments || 0,
      p.shares || 0,
      p.notes || '',
      p.isMilestone ? 1 : 0,
      p.milestoneReward || '',
      now
    );
  }

  res.json({ success: true, count: posts.length });
});

// 8. Get Milestones
app.get('/api/milestones', requireAuth, (req, res) => {
  const userId = req.userId!;
  const rows = db.prepare('SELECT * FROM milestones WHERE userId = ? ORDER BY day ASC').all(userId) as any[];

  if (rows.length === 0) {
    for (const m of DEFAULT_MILESTONES) {
      db.prepare(`
        INSERT OR REPLACE INTO milestones (userId, day, rewardTitle, isUnlocked, rewardNote)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, m.day, m.rewardTitle, m.isUnlocked, m.rewardNote);
    }
    return res.json({ milestones: DEFAULT_MILESTONES });
  }

  const milestones = rows.map((r) => ({
    day: r.day,
    rewardTitle: r.rewardTitle,
    isUnlocked: Boolean(r.isUnlocked),
    rewardNote: r.rewardNote,
  }));

  res.json({ milestones });
});

// 9. Update Milestones
app.put('/api/milestones', requireAuth, (req, res) => {
  const userId = req.userId!;
  const { milestones } = req.body;

  if (Array.isArray(milestones)) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO milestones (userId, day, rewardTitle, isUnlocked, rewardNote)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const m of milestones) {
      stmt.run(userId, m.day, m.rewardTitle, m.isUnlocked ? 1 : 0, m.rewardNote || '');
    }
  }

  res.json({ success: true });
});

// 10. Reset Challenge Posts
app.post('/api/posts/reset', requireAuth, (req, res) => {
  const userId = req.userId!;
  const userProfile = db.prepare('SELECT challengeStartDate FROM users WHERE id = ?').get(userId) as any;

  // Clear existing posts
  db.prepare('DELETE FROM posts WHERE userId = ?').run(userId);
  db.prepare('DELETE FROM milestones WHERE userId = ?').run(userId);

  // Reseed default Day 1 example + Days 2-100 blank
  seedUserDefaultPosts(userId, userProfile?.challengeStartDate);

  res.json({ success: true, message: 'Challenge reset successfully' });
});

// Serve frontend static assets in production
const DIST_DIR = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[API Server] Running on http://127.0.0.1:${PORT}`);
});
