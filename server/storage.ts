import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  User,
  Lesson,
  LiveClass,
  LiveChatMessage,
  SpotSignal,
  FuturesSignal,
  MarketAnalysisReport,
  LearningMaterial,
  Announcement,
  CoursePricingConfig,
  PaymentTransaction,
  TransactionStatus,
  SocialChannel,
  CommunityPoll,
  UserRole
} from '../src/types/index.ts';

interface DatabaseSchema {
  users: (User & { passwordHash: string; salt: string })[];
  sessions: { token: string; userId: string; role: UserRole; expiresAt: number }[];
  lessons: Lesson[];
  liveClasses: LiveClass[];
  chatMessages: LiveChatMessage[];
  spotSignals: SpotSignal[];
  futuresSignals: FuturesSignal[];
  analysisReports: MarketAnalysisReport[];
  materials: LearningMaterial[];
  announcements: Announcement[];
  pricingConfig: CoursePricingConfig;
  transactions: PaymentTransaction[];
  channels: SocialChannel[];
  polls: CommunityPoll[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const candidate = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(hash, 'hex'));
}

export function createPasswordRecord(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  return { salt, passwordHash };
}

function getInitialData(): DatabaseSchema {
  const adminCreds = createPasswordRecord('ZIA@#1234@#1');
  const studentCreds = createPasswordRecord('studentPass123!');

  return {
    sessions: [],
    users: [
      {
        id: 'user_admin',
        email: 'admin@gmail.com',
        name: 'Zia Khan',
        role: 'admin',
        tier: 'premium',
        hasBeginnerAccess: true,
        hasAdvancedAccess: true,
        createdAt: '2026-01-10T10:00:00Z',
        completedLessons: [],
        savedSignals: [],
        attendedClasses: [],
        avatarUrl: '/src/assets/images/instructor_lead_avatar_1792164740686.jpg',
        passwordHash: adminCreds.passwordHash,
        salt: adminCreds.salt,
      },
      {
        id: 'user_admin_zia',
        email: 'ziakhan5348@gmail.com',
        name: 'Zia Khan',
        role: 'admin',
        tier: 'premium',
        hasBeginnerAccess: true,
        hasAdvancedAccess: true,
        createdAt: '2026-01-10T10:00:00Z',
        completedLessons: [],
        savedSignals: [],
        attendedClasses: [],
        avatarUrl: '/src/assets/images/instructor_lead_avatar_1792164740686.jpg',
        passwordHash: adminCreds.passwordHash,
        salt: adminCreds.salt,
      },
      {
        id: 'user_student_alex',
        email: 'student@coursecrash.io',
        name: 'Alex Chen',
        role: 'student',
        tier: 'free',
        hasBeginnerAccess: false,
        hasAdvancedAccess: false,
        createdAt: '2026-02-15T14:30:00Z',
        completedLessons: [],
        savedSignals: [],
        attendedClasses: [],
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        passwordHash: studentCreds.passwordHash,
        salt: studentCreds.salt,
      }
    ],
    // Clean slate: all pre-seeded mock lessons removed per user instruction.
    // Only videos uploaded by the admin (Zia Khan) will appear.
    lessons: [],

    liveClasses: [
      {
        id: 'class_live_1',
        title: 'NY Session Live Execution & Order Book Depth Analysis',
        description: 'Live market analysis and trade execution as New York equities open. Real-time CVD tracking and liquidity sweeps.',
        instructorName: 'Zia Khan',
        instructorRole: 'Head of Quantitative Strategy',
        instructorAvatar: '/src/assets/images/instructor_lead_avatar_1792164740686.jpg',
        scheduledAt: new Date(Date.now() + 1800000).toISOString(),
        durationMinutes: 60,
        status: 'live',
        platform: 'YouTube Live',
        streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UC4R8DWoMoI7CAwX8_BQQ50A',
        meetingLink: 'https://meet.google.com/zia-live-desk',
        notesDoc: 'Focus: BTC 4H PDL sweep and $64,200 absorption cluster.',
        attendees: ['user_admin_zia', 'user_student_alex'],
        createdAt: '2026-10-18T10:00:00Z',
      }
    ],

    chatMessages: [
      {
        id: 'msg_1',
        classId: 'class_live_1',
        userId: 'user_admin_zia',
        userName: 'Zia Khan',
        userRole: 'admin',
        text: 'Welcome to today’s live desk. We are monitoring BTC approaching the $65,200 liquidity cluster.',
        timestamp: '14:32:05',
        isQuestion: false,
        upvotes: 14,
      }
    ],

    // Clean slate: all old pre-seeded mock signals deleted per user instruction.
    // Only signals generated by the admin will be listed.
    spotSignals: [],
    futuresSignals: [],

    analysisReports: [],
    materials: [],
    announcements: [
      {
        id: 'ann_1',
        title: 'Welcome to Course Crash Official Platform',
        content: 'Our quantitative video lessons and real-time execution desks are now live. Admin Zia Khan publishes daily updates.',
        priority: 'Normal',
        date: new Date().toISOString().split('T')[0],
        author: 'Course Crash Desk'
      }
    ],

    pricingConfig: {
      beginnerPrice: 2,
      advancedPrice: 5,
      currency: 'USD',
      usdtTrc20Address: 'TQ3aXm9yKLZpTRC20OfficialCourseCrashDesk99',
      usdtBep20Address: '0x71C56897b209E780f2d91B0c0B345672A1B1C892',
      easypaisaTitle: 'Course Crash Official Desk',
      easypaisaNumber: '0300-8492019',
      jazzcashTitle: 'Course Crash Official Desk',
      jazzcashNumber: '0301-7291048',
      bankName: 'Meezan Bank Ltd / Standard Chartered',
      bankAccountTitle: 'Course Crash Digital Academy',
      bankIban: 'PK36MEZN0001092847291048',
      upiId: 'coursecrash@okaxis',
      whatsappSupport: '+92 300 8492019',
      paymentNotice: 'Send the exact fee amount set by admin ($2 Beginner / $5 Advance). Enter your transaction reference or receipt to activate your account.',
      autoApproveInstant: true
    },

    transactions: [],

    // Official Channels manageable by Admin
    channels: [
      {
        id: 'chan_youtube',
        title: 'Official YouTube Trading Desk',
        platform: 'youtube',
        url: 'https://youtube.com/@coursecrash',
        handle: '@coursecrash',
        description: 'Live market analysis, chart breakdowns, and trading recordings.',
        subscribers: '128K Subscribers',
        active: true
      },
      {
        id: 'chan_telegram',
        title: 'VIP Telegram Alerts Channel',
        platform: 'telegram',
        url: 'https://t.me/coursecrash_official',
        handle: '@coursecrash_official',
        description: 'Instant alerts for live streams, market moves, and signals.',
        subscribers: '45K Members',
        active: true
      },
      {
        id: 'chan_instagram',
        title: 'Official Instagram Community',
        platform: 'instagram',
        url: 'https://instagram.com/coursecrash.official',
        handle: '@coursecrash.official',
        description: 'Daily market recaps, trade psychology, and updates.',
        subscribers: '92K Followers',
        active: true
      },
      {
        id: 'chan_whatsapp',
        title: 'Student WhatsApp Broadcast Desk',
        platform: 'whatsapp',
        url: 'https://chat.whatsapp.com/coursecrash',
        handle: '+92 300 8492019',
        description: 'Direct student community announcements & schedule reminders.',
        subscribers: 'Direct Support',
        active: true
      }
    ],

    // Community Lecture & Analysis Request Polls
    polls: [
      {
        id: 'poll_next_lecture',
        title: 'Which asset should our next live market analysis & lecture cover?',
        description: 'Cast your vote! The winning topic with the highest votes will be thoroughly analyzed in our upcoming live stream.',
        options: [
          { id: 'opt_btc', text: 'Bitcoin (BTC) — Post-Halving Liquidity Sweep & $75K Target', votes: 52 },
          { id: 'opt_gold', text: 'Gold (XAUUSD) — Macro Breakout vs. Bitcoin Correlation', votes: 47 },
          { id: 'opt_eth', text: 'Ethereum (ETH) — L1 Institutional Accumulation & Gas Dynamics', votes: 23 },
          { id: 'opt_sol', text: 'Solana (SOL) — Futures CVD Absorption & Breakout Levels', votes: 31 },
        ],
        totalVotes: 153,
        userVotes: {},
        active: true,
        analysisDate: 'Upcoming Live Session',
        createdAt: new Date().toISOString()
      }
    ]
  };
}

class StorageManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.pricingConfig) parsed.pricingConfig = getInitialData().pricingConfig;
        if (!parsed.transactions) parsed.transactions = [];
        if (!parsed.channels) parsed.channels = getInitialData().channels;
        if (!parsed.polls) parsed.polls = getInitialData().polls;

        // Clean any duplicate or leading numbers from poll options
        if (parsed.polls && Array.isArray(parsed.polls)) {
          parsed.polls = parsed.polls.map((p: any) => ({
            ...p,
            options: (p.options || []).map((opt: any) => ({
              ...opt,
              text: (opt.text || '').replace(/^\d+[\.\)]\s*/, '').trim()
            }))
          }));
        }

        // Wipe out any old preseeded mock lessons or signals if still present
        if (parsed.lessons) {
          parsed.lessons = parsed.lessons.filter((l: any) => !l.id.startsWith('beg_') && !l.id.startsWith('adv_'));
        } else {
          parsed.lessons = [];
        }
        if (parsed.spotSignals) {
          parsed.spotSignals = parsed.spotSignals.filter((s: any) => s.id !== 'spot_1' && s.id !== 'spot_2' && s.id !== 'spot_3' && s.id !== 'spot_4' && s.id !== 'spot_5');
        } else {
          parsed.spotSignals = [];
        }
        if (parsed.futuresSignals) {
          parsed.futuresSignals = parsed.futuresSignals.filter((f: any) => f.id !== 'fut_1' && f.id !== 'fut_2' && f.id !== 'fut_3' && f.id !== 'fut_4' && f.id !== 'fut_5');
        } else {
          parsed.futuresSignals = [];
        }

        // Sessions persistence
        if (!parsed.sessions || !Array.isArray(parsed.sessions)) {
          parsed.sessions = [];
        } else {
          // Purge expired sessions (valid for 30 days)
          parsed.sessions = parsed.sessions.filter((s: any) => s.expiresAt > Date.now());
        }

        // Ensure users list has both admin accounts and all registered students
        if (parsed.users && Array.isArray(parsed.users)) {
          const defaultAdminCreds = createPasswordRecord('ZIA@#1234@#1');

          // Ensure admin@gmail.com exists
          let admin1 = parsed.users.find((u: any) => u.email === 'admin@gmail.com');
          if (!admin1) {
            parsed.users.unshift({
              id: 'user_admin',
              email: 'admin@gmail.com',
              name: 'Zia Khan',
              role: 'admin',
              tier: 'premium',
              hasBeginnerAccess: true,
              hasAdvancedAccess: true,
              createdAt: '2026-01-10T10:00:00Z',
              completedLessons: [],
              savedSignals: [],
              attendedClasses: [],
              avatarUrl: '/src/assets/images/instructor_lead_avatar_1792164740686.jpg',
              passwordHash: defaultAdminCreds.passwordHash,
              salt: defaultAdminCreds.salt,
            });
          } else {
            admin1.role = 'admin';
            admin1.hasBeginnerAccess = true;
            admin1.hasAdvancedAccess = true;
            if (!admin1.passwordHash || !admin1.salt) {
              admin1.passwordHash = defaultAdminCreds.passwordHash;
              admin1.salt = defaultAdminCreds.salt;
            }
          }

          // Ensure ziakhan5348@gmail.com also exists as an admin
          let admin2 = parsed.users.find((u: any) => u.email === 'ziakhan5348@gmail.com');
          if (!admin2) {
            parsed.users.unshift({
              id: 'user_admin_zia',
              email: 'ziakhan5348@gmail.com',
              name: 'Zia Khan',
              role: 'admin',
              tier: 'premium',
              hasBeginnerAccess: true,
              hasAdvancedAccess: true,
              createdAt: '2026-01-10T10:00:00Z',
              completedLessons: [],
              savedSignals: [],
              attendedClasses: [],
              avatarUrl: '/src/assets/images/instructor_lead_avatar_1792164740686.jpg',
              passwordHash: defaultAdminCreds.passwordHash,
              salt: defaultAdminCreds.salt,
            });
          } else {
            admin2.role = 'admin';
            admin2.hasBeginnerAccess = true;
            admin2.hasAdvancedAccess = true;
            if (!admin2.passwordHash || !admin2.salt) {
              admin2.passwordHash = defaultAdminCreds.passwordHash;
              admin2.salt = defaultAdminCreds.salt;
            }
          }
        }

        return parsed;
      }
    } catch (e) {
      console.error('Error reading db.json, falling back to seed:', e);
    }
    const seed = getInitialData();
    this.saveData(seed);
    return seed;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving db.json:', e);
    }
  }

  // --- Users ---
  getUsers(): User[] {
    return this.data.users.map(({ passwordHash, salt, ...rest }) => rest);
  }

  findUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(params: { email: string; name: string; password: string; role?: 'admin' | 'student'; tier?: 'free' | 'premium' }): User {
    const creds = createPasswordRecord(params.password);
    const newUser = {
      id: `user_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      email: params.email.trim().toLowerCase(),
      name: params.name.trim(),
      role: params.role || 'student',
      tier: params.tier || 'free',
      hasBeginnerAccess: (params.role === 'admin' || params.tier === 'premium'),
      hasAdvancedAccess: (params.role === 'admin' || params.tier === 'premium'),
      createdAt: new Date().toISOString(),
      completedLessons: [],
      savedSignals: [],
      attendedClasses: [],
      passwordHash: creds.passwordHash,
      salt: creds.salt,
    };
    this.data.users.push(newUser);
    this.saveData(this.data);
    const { passwordHash, salt, ...cleanUser } = newUser;
    return cleanUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.saveData(this.data);
    const { passwordHash, salt, ...cleanUser } = this.data.users[idx];
    return cleanUser;
  }

  setUserPassword(id: string, newPassword: string): boolean {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    const creds = createPasswordRecord(newPassword);
    this.data.users[idx].passwordHash = creds.passwordHash;
    this.data.users[idx].salt = creds.salt;
    this.saveData(this.data);
    return true;
  }

  // --- Lessons ---
  getLessons(): Lesson[] {
    return this.data.lessons;
  }

  getLessonById(id: string): Lesson | null {
    return this.data.lessons.find(l => l.id === id) || null;
  }

  createLesson(lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Lesson {
    const newLesson: Lesson = {
      ...lesson,
      id: `lesson_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.lessons.push(newLesson);
    this.saveData(this.data);
    return newLesson;
  }

  updateLesson(id: string, updates: Partial<Lesson>): Lesson | null {
    const idx = this.data.lessons.findIndex(l => l.id === id);
    if (idx === -1) return null;
    this.data.lessons[idx] = {
      ...this.data.lessons[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData(this.data);
    return this.data.lessons[idx];
  }

  deleteLesson(id: string): boolean {
    const before = this.data.lessons.length;
    this.data.lessons = this.data.lessons.filter(l => l.id !== id);
    if (this.data.lessons.length !== before) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Live Classes ---
  getLiveClasses(): LiveClass[] {
    return this.data.liveClasses;
  }

  getLiveClassById(id: string): LiveClass | null {
    return this.data.liveClasses.find(c => c.id === id) || null;
  }

  createLiveClass(params: Omit<LiveClass, 'id' | 'createdAt' | 'attendees'>): LiveClass {
    const newClass: LiveClass = {
      ...params,
      id: `class_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      attendees: [],
      createdAt: new Date().toISOString(),
    };
    this.data.liveClasses.unshift(newClass);
    this.saveData(this.data);
    return newClass;
  }

  updateLiveClass(id: string, updates: Partial<LiveClass>): LiveClass | null {
    const idx = this.data.liveClasses.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.liveClasses[idx] = { ...this.data.liveClasses[idx], ...updates };
    this.saveData(this.data);
    return this.data.liveClasses[idx];
  }

  deleteLiveClass(id: string): boolean {
    const before = this.data.liveClasses.length;
    this.data.liveClasses = this.data.liveClasses.filter(c => c.id !== id);
    if (this.data.liveClasses.length !== before) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  recordClassAttendance(classId: string, userId: string): LiveClass | null {
    const classIdx = this.data.liveClasses.findIndex(c => c.id === classId);
    if (classIdx === -1) return null;
    if (!this.data.liveClasses[classIdx].attendees.includes(userId)) {
      this.data.liveClasses[classIdx].attendees.push(userId);
    }
    const userIdx = this.data.users.findIndex(u => u.id === userId);
    if (userIdx !== -1 && !this.data.users[userIdx].attendedClasses.includes(classId)) {
      this.data.users[userIdx].attendedClasses.push(classId);
    }
    this.saveData(this.data);
    return this.data.liveClasses[classIdx];
  }

  getChatMessages(classId: string): LiveChatMessage[] {
    return this.data.chatMessages.filter(m => m.classId === classId);
  }

  addChatMessage(msg: Omit<LiveChatMessage, 'id' | 'timestamp' | 'upvotes'>): LiveChatMessage {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newMsg: LiveChatMessage = {
      ...msg,
      id: `msg_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      timestamp: timeStr,
      upvotes: 0,
    };
    this.data.chatMessages.push(newMsg);
    this.saveData(this.data);
    return newMsg;
  }

  upvoteChatMessage(msgId: string): LiveChatMessage | null {
    const idx = this.data.chatMessages.findIndex(m => m.id === msgId);
    if (idx === -1) return null;
    this.data.chatMessages[idx].upvotes += 1;
    this.saveData(this.data);
    return this.data.chatMessages[idx];
  }

  // --- Spot Signals ---
  getSpotSignals(): SpotSignal[] {
    return this.data.spotSignals;
  }

  createSpotSignal(signal: Omit<SpotSignal, 'id' | 'createdAt' | 'updatedAt'>): SpotSignal {
    const newSignal: SpotSignal = {
      ...signal,
      id: `spot_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.spotSignals.unshift(newSignal);
    this.saveData(this.data);
    return newSignal;
  }

  updateSpotSignal(id: string, updates: Partial<SpotSignal>): SpotSignal | null {
    const idx = this.data.spotSignals.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.spotSignals[idx] = {
      ...this.data.spotSignals[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData(this.data);
    return this.data.spotSignals[idx];
  }

  deleteSpotSignal(id: string): boolean {
    const before = this.data.spotSignals.length;
    this.data.spotSignals = this.data.spotSignals.filter(s => s.id !== id);
    if (this.data.spotSignals.length !== before) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Futures Signals ---
  getFuturesSignals(): FuturesSignal[] {
    return this.data.futuresSignals;
  }

  createFuturesSignal(signal: Omit<FuturesSignal, 'id' | 'createdAt' | 'updatedAt'>): FuturesSignal {
    const newSignal: FuturesSignal = {
      ...signal,
      id: `fut_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.futuresSignals.unshift(newSignal);
    this.saveData(this.data);
    return newSignal;
  }

  updateFuturesSignal(id: string, updates: Partial<FuturesSignal>): FuturesSignal | null {
    const idx = this.data.futuresSignals.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.futuresSignals[idx] = {
      ...this.data.futuresSignals[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData(this.data);
    return this.data.futuresSignals[idx];
  }

  deleteFuturesSignal(id: string): boolean {
    const before = this.data.futuresSignals.length;
    this.data.futuresSignals = this.data.futuresSignals.filter(s => s.id !== id);
    if (this.data.futuresSignals.length !== before) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Official Channels ---
  getChannels(): SocialChannel[] {
    if (!this.data.channels) {
      this.data.channels = getInitialData().channels;
      this.saveData(this.data);
    }
    return this.data.channels;
  }

  createChannel(channel: Omit<SocialChannel, 'id'>): SocialChannel {
    const newChan: SocialChannel = {
      ...channel,
      id: `chan_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    };
    if (!this.data.channels) this.data.channels = [];
    this.data.channels.push(newChan);
    this.saveData(this.data);
    return newChan;
  }

  updateChannel(id: string, updates: Partial<SocialChannel>): SocialChannel | null {
    if (!this.data.channels) return null;
    const idx = this.data.channels.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.channels[idx] = { ...this.data.channels[idx], ...updates };
    this.saveData(this.data);
    return this.data.channels[idx];
  }

  deleteChannel(id: string): boolean {
    if (!this.data.channels) return false;
    const before = this.data.channels.length;
    this.data.channels = this.data.channels.filter(c => c.id !== id);
    if (this.data.channels.length !== before) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Community Lecture & Analysis Request Polls ---
  getPolls(): CommunityPoll[] {
    if (!this.data.polls) {
      this.data.polls = getInitialData().polls;
      this.saveData(this.data);
    }
    return this.data.polls;
  }

  createPoll(pollData: { title: string; description?: string; options: string[]; analysisDate?: string }): CommunityPoll {
    const newPoll: CommunityPoll = {
      id: `poll_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      title: pollData.title,
      description: pollData.description,
      options: pollData.options.map((optText, index) => ({
        id: `opt_${index + 1}_${crypto.randomBytes(2).toString('hex')}`,
        text: optText,
        votes: 0,
      })),
      totalVotes: 0,
      userVotes: {},
      active: true,
      analysisDate: pollData.analysisDate || 'Upcoming Session',
      createdAt: new Date().toISOString(),
    };
    if (!this.data.polls) this.data.polls = [];
    this.data.polls.unshift(newPoll);
    this.saveData(this.data);
    return newPoll;
  }

  updatePoll(id: string, updates: Partial<CommunityPoll>): CommunityPoll | null {
    if (!this.data.polls) return null;
    const idx = this.data.polls.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.polls[idx] = { ...this.data.polls[idx], ...updates };
    this.saveData(this.data);
    return this.data.polls[idx];
  }

  deletePoll(id: string): boolean {
    if (!this.data.polls) return false;
    const before = this.data.polls.length;
    this.data.polls = this.data.polls.filter(p => p.id !== id);
    if (this.data.polls.length !== before) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  votePoll(pollId: string, optionId: string, userId: string): CommunityPoll | null {
    if (!this.data.polls) return null;
    const poll = this.data.polls.find(p => p.id === pollId);
    if (!poll || !poll.active) return null;

    if (!poll.userVotes) poll.userVotes = {};

    const existingVote = poll.userVotes[userId];
    if (existingVote) {
      // decrement old option
      const oldOpt = poll.options.find(o => o.id === existingVote);
      if (oldOpt && oldOpt.votes > 0) oldOpt.votes -= 1;
    } else {
      poll.totalVotes += 1;
    }

    // increment new option
    const newOpt = poll.options.find(o => o.id === optionId);
    if (!newOpt) return null;
    newOpt.votes += 1;

    poll.userVotes[userId] = optionId;

    // determine current winner
    let maxVotes = -1;
    let winningId = '';
    poll.options.forEach(o => {
      if (o.votes > maxVotes) {
        maxVotes = o.votes;
        winningId = o.id;
      }
    });
    poll.winnerOptionId = winningId;

    this.saveData(this.data);
    return poll;
  }

  // --- Reports & Materials ---
  getAnalysisReports(): MarketAnalysisReport[] {
    return this.data.analysisReports;
  }

  createAnalysisReport(rep: Omit<MarketAnalysisReport, 'id' | 'date'>): MarketAnalysisReport {
    const newRep: MarketAnalysisReport = {
      ...rep,
      id: `rep_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      date: new Date().toISOString().split('T')[0]
    };
    this.data.analysisReports.unshift(newRep);
    this.saveData(this.data);
    return newRep;
  }

  deleteAnalysisReport(id: string): boolean {
    const before = this.data.analysisReports.length;
    this.data.analysisReports = this.data.analysisReports.filter(r => r.id !== id);
    if (this.data.analysisReports.length !== before) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  getMaterials(): LearningMaterial[] {
    return this.data.materials;
  }

  createMaterial(mat: Omit<LearningMaterial, 'id'>): LearningMaterial {
    const newMat: LearningMaterial = {
      ...mat,
      id: `mat_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    };
    this.data.materials.unshift(newMat);
    this.saveData(this.data);
    return newMat;
  }

  deleteMaterial(id: string): boolean {
    const before = this.data.materials.length;
    this.data.materials = this.data.materials.filter(m => m.id !== id);
    if (this.data.materials.length !== before) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  getAnnouncements(): Announcement[] {
    return this.data.announcements;
  }

  createAnnouncement(ann: Omit<Announcement, 'id' | 'date'>): Announcement {
    const newAnn: Announcement = {
      ...ann,
      id: `ann_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      date: new Date().toISOString().split('T')[0]
    };
    this.data.announcements.unshift(newAnn);
    this.saveData(this.data);
    return newAnn;
  }

  deleteAnnouncement(id: string): boolean {
    const before = this.data.announcements.length;
    this.data.announcements = this.data.announcements.filter(a => a.id !== id);
    if (this.data.announcements.length !== before) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Pricing & Payments ---
  getPricingConfig(): CoursePricingConfig {
    if (!this.data.pricingConfig) {
      this.data.pricingConfig = getInitialData().pricingConfig;
    }
    return this.data.pricingConfig;
  }

  updatePricingConfig(updates: Partial<CoursePricingConfig>): CoursePricingConfig {
    this.data.pricingConfig = {
      ...this.getPricingConfig(),
      ...updates
    };
    this.saveData(this.data);
    return this.data.pricingConfig;
  }

  getTransactions(): PaymentTransaction[] {
    return this.data.transactions || [];
  }

  isUserEnrolled(userId: string, courseType: 'beginner' | 'advanced'): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (courseType === 'beginner') return !!user.hasBeginnerAccess;
    if (courseType === 'advanced') return !!user.hasAdvancedAccess || user.tier === 'premium';
    return false;
  }

  findTransactionById(id: string): PaymentTransaction | undefined {
    return (this.data.transactions || []).find(t => t.id === id);
  }

  findTransactionByStripeSession(sessionId: string): PaymentTransaction | undefined {
    return (this.data.transactions || []).find(t => t.stripeSessionId === sessionId);
  }

  updateTransaction(id: string, updates: Partial<PaymentTransaction>): PaymentTransaction | null {
    if (!this.data.transactions) this.data.transactions = [];
    const idx = this.data.transactions.findIndex(t => t.id === id);
    if (idx === -1) return null;

    this.data.transactions[idx] = {
      ...this.data.transactions[idx],
      ...updates
    };
    this.saveData(this.data);
    return this.data.transactions[idx];
  }

  createTransaction(txData: Omit<PaymentTransaction, 'id' | 'createdAt'>): PaymentTransaction {
    const newTx: PaymentTransaction = {
      ...txData,
      id: `tx_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      createdAt: new Date().toISOString()
    };
    if (!this.data.transactions) this.data.transactions = [];
    this.data.transactions.unshift(newTx);

    if (newTx.status === 'approved') {
      newTx.paidAt = new Date().toISOString();
      this.activateUserCourse(newTx.userId, newTx.courseType, {
        orderId: newTx.id,
        transactionReference: newTx.transactionReference,
        amount: newTx.amount,
        currency: newTx.currency,
        paymentMethod: newTx.paymentMethod
      });
    }

    this.saveData(this.data);
    return newTx;
  }

  updateTransactionStatus(
    id: string,
    status: TransactionStatus,
    adminNotes?: string,
    failureReason?: string
  ): { transaction: PaymentTransaction | null; user?: User } {
    if (!this.data.transactions) this.data.transactions = [];
    const idx = this.data.transactions.findIndex(t => t.id === id);
    if (idx === -1) return { transaction: null };

    this.data.transactions[idx].status = status;
    this.data.transactions[idx].reviewedAt = new Date().toISOString();
    if (status === 'approved') {
      this.data.transactions[idx].paidAt = new Date().toISOString();
    }
    if (adminNotes !== undefined) {
      this.data.transactions[idx].adminNotes = adminNotes;
    }
    if (failureReason !== undefined) {
      this.data.transactions[idx].failureReason = failureReason;
    }

    let updatedUser: User | undefined;
    if (status === 'approved') {
      const tx = this.data.transactions[idx];
      updatedUser = this.activateUserCourse(tx.userId, tx.courseType, {
        orderId: tx.id,
        transactionReference: tx.transactionReference,
        amount: tx.amount,
        currency: tx.currency,
        paymentMethod: tx.paymentMethod
      });
    }

    this.saveData(this.data);
    return { transaction: this.data.transactions[idx], user: updatedUser };
  }

  activateUserCourse(
    userId: string,
    courseType: 'beginner' | 'advanced',
    enrollmentMeta?: {
      orderId?: string;
      transactionReference?: string;
      amount?: number;
      currency?: string;
      paymentMethod?: string;
    }
  ): User | undefined {
    const userIdx = this.data.users.findIndex(u => u.id === userId);
    if (userIdx === -1) return undefined;

    const user = this.data.users[userIdx];
    if (!user.enrollments) {
      user.enrollments = [];
    }

    if (courseType === 'beginner') {
      user.hasBeginnerAccess = true;
    } else if (courseType === 'advanced') {
      user.hasAdvancedAccess = true;
      user.tier = 'premium';
    }

    // Add enrollment record if not already recorded for this transaction reference or order
    const existingEnrollment = user.enrollments.find(e =>
      (enrollmentMeta?.orderId && e.orderId === enrollmentMeta.orderId) ||
      (enrollmentMeta?.transactionReference && e.transactionReference === enrollmentMeta.transactionReference) ||
      (e.courseType === courseType && e.status === 'active')
    );

    if (!existingEnrollment) {
      user.enrollments.unshift({
        id: `enr_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
        courseType,
        enrolledAt: new Date().toISOString(),
        amount: enrollmentMeta?.amount || (courseType === 'beginner' ? this.getPricingConfig().beginnerPrice : this.getPricingConfig().advancedPrice),
        currency: enrollmentMeta?.currency || this.getPricingConfig().currency || 'USD',
        transactionReference: enrollmentMeta?.transactionReference || `TX_SYS_${Date.now()}`,
        orderId: enrollmentMeta?.orderId,
        paymentMethod: enrollmentMeta?.paymentMethod || 'verified_gateway',
        status: 'active'
      });
    }

    this.saveData(this.data);
    const { passwordHash, salt, ...safeUser } = user;
    return safeUser;
  }

  revokeUserCourse(userId: string, courseType: 'beginner' | 'advanced'): User | undefined {
    const userIdx = this.data.users.findIndex(u => u.id === userId);
    if (userIdx === -1) return undefined;

    const user = this.data.users[userIdx];
    if (courseType === 'beginner') {
      user.hasBeginnerAccess = false;
    } else if (courseType === 'advanced') {
      user.hasAdvancedAccess = false;
      if (user.role !== 'admin') {
        user.tier = 'free';
      }
    }

    if (user.enrollments) {
      user.enrollments = user.enrollments.map(e => {
        if (e.courseType === courseType && e.status === 'active') {
          return { ...e, status: 'revoked' as const };
        }
        return e;
      });
    }

    this.saveData(this.data);
    const { passwordHash, salt, ...safeUser } = user;
    return safeUser;
  }

  refundTransaction(id: string, reason?: string, refundAmount?: number): { transaction: PaymentTransaction | null; user?: User } {
    if (!this.data.transactions) this.data.transactions = [];
    const idx = this.data.transactions.findIndex(t => t.id === id);
    if (idx === -1) return { transaction: null };

    const tx = this.data.transactions[idx];
    tx.status = 'refunded';
    tx.refundedAt = new Date().toISOString();
    tx.refundReason = reason || 'Admin issued refund';
    tx.refundAmount = refundAmount !== undefined ? refundAmount : tx.amount;
    tx.refundId = `ref_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    // Revoke course access for that student upon refund
    const updatedUser = this.revokeUserCourse(tx.userId, tx.courseType);

    this.saveData(this.data);
    return { transaction: tx, user: updatedUser };
  }

  // Session token management persisted in database
  saveSession(token: string, userId: string, role: UserRole, expiresAt?: number): void {
    if (!this.data.sessions) this.data.sessions = [];
    const exp = expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days remember me
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.data.sessions.push({ token, userId, role, expiresAt: exp });
    this.saveData(this.data);
  }

  findSession(token: string): { userId: string; role: UserRole; expiresAt: number } | undefined {
    if (!this.data.sessions) return undefined;
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return undefined;
    if (session.expiresAt <= Date.now()) {
      this.deleteSession(token);
      return undefined;
    }
    return session;
  }

  deleteSession(token: string): void {
    if (!this.data.sessions) return;
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.saveData(this.data);
  }
}

export const storage = new StorageManager();
