import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'creator_toolkit.db');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high performance concurrent reads and writes
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT,
    displayName TEXT,
    photoURL TEXT,
    creatorHandle TEXT,
    country TEXT,
    dateOfBirth TEXT,
    niche TEXT,
    challengeStartDate TEXT,
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS posts (
    userId TEXT,
    day INTEGER,
    title TEXT,
    status TEXT,
    category TEXT,
    idea TEXT,
    targetAudience TEXT,
    visualHook TEXT,
    spokenHook TEXT,
    textOverlayHook TEXT,
    script TEXT,
    bulletPoints TEXT,
    cta TEXT,
    format TEXT,
    visualNotes TEXT,
    shotList TEXT,
    thumbnailConcept TEXT,
    publishDateETA TEXT,
    publishedAt TEXT,
    platform TEXT,
    secondaryPlatforms TEXT,
    liveUrl TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    notes TEXT,
    isMilestone INTEGER DEFAULT 0,
    milestoneReward TEXT,
    updatedAt TEXT,
    PRIMARY KEY (userId, day)
  );

  CREATE TABLE IF NOT EXISTS milestones (
    userId TEXT,
    day INTEGER,
    rewardTitle TEXT,
    isUnlocked INTEGER DEFAULT 0,
    rewardNote TEXT,
    PRIMARY KEY (userId, day)
  );
`);

console.log(`[Database] SQLite database initialized at: ${DB_PATH}`);
