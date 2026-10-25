import type {
  User,
  Lesson,
  LiveClass,
  LiveChatMessage,
  SpotSignal,
  FuturesSignal,
  MarketTicker,
  MarketAnalysisReport,
  LearningMaterial,
  Announcement,
  CoursePricingConfig,
  PaymentTransaction,
  TransactionStatus,
  SocialChannel,
  CommunityPoll,
  PaymentGatewayInfo,
  CheckoutSessionResponse,
  CourseEnrollment
} from '../types/index.ts';

const TOKEN_KEY = 'course_crash_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}: Failed to execute request`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(data.token);
    return data;
  },

  async register(params: { email: string; password: string; name: string }): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setStoredToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue even if network error
    } finally {
      setStoredToken(null);
    }
  },

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string; demoHelp?: string }> {
    return request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
    return request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword }),
    });
  },

  async toggleLessonProgress(lessonId: string, completed: boolean): Promise<{ user: User }> {
    return request<{ user: User }>('/api/user/progress', {
      method: 'POST',
      body: JSON.stringify({ lessonId, completed }),
    });
  },

  async toggleSavedSignal(signalId: string): Promise<{ user: User }> {
    return request<{ user: User }>('/api/user/saved-signals', {
      method: 'POST',
      body: JSON.stringify({ signalId }),
    });
  },

  async checkEmail(email: string): Promise<{ validFormat: boolean; exists: boolean; email?: string; name?: string; message?: string }> {
    return request('/api/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async updateTier(tier: 'free' | 'premium'): Promise<{ user: User }> {
    return request<{ user: User }>('/api/user/tier', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    });
  },

  async updateProfile(updates: { name?: string; avatarUrl?: string }): Promise<{ user: User }> {
    return request<{ user: User }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Pricing & Payments
  async getPricing(): Promise<{ pricing: CoursePricingConfig }> {
    return request<{ pricing: CoursePricingConfig }>('/api/pricing');
  },

  async updatePricing(updates: Partial<CoursePricingConfig>): Promise<{ success: boolean; pricing: CoursePricingConfig; message: string }> {
    return request<{ success: boolean; pricing: CoursePricingConfig; message: string }>('/api/admin/pricing', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async getPaymentGatewayInfo(): Promise<{ gateway: PaymentGatewayInfo }> {
    return request<{ gateway: PaymentGatewayInfo }>('/api/payments/gateway-info');
  },

  async createCheckoutSession(params: {
    courseType: 'beginner' | 'advanced';
  }): Promise<CheckoutSessionResponse & { success: boolean; orderRef: string; courseTitle: string }> {
    return request('/api/payments/create-session', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async verifyCheckoutSession(sessionId: string): Promise<{
    success: boolean;
    status: string;
    transaction?: PaymentTransaction;
    user?: User;
    message: string;
  }> {
    return request('/api/payments/verify-session', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  },

  async processSandboxCheckout(params: {
    orderId: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
    cardHolder: string;
  }): Promise<{
    success: boolean;
    status: string;
    transaction: PaymentTransaction;
    user?: User;
    message: string;
  }> {
    return request('/api/payments/sandbox-checkout', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async getAdminTransactions(): Promise<{ transactions: PaymentTransaction[] }> {
    return request<{ transactions: PaymentTransaction[] }>('/api/admin/transactions');
  },

  async updateTransactionStatus(
    id: string,
    status: TransactionStatus,
    adminNotes?: string,
    failureReason?: string
  ): Promise<{ success: boolean; transaction: PaymentTransaction; user?: User; message: string }> {
    return request<{ success: boolean; transaction: PaymentTransaction; user?: User; message: string }>(`/api/admin/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes, failureReason }),
    });
  },

  async issueRefund(params: {
    transactionId: string;
    reason?: string;
    amount?: number;
  }): Promise<{ success: boolean; transaction: PaymentTransaction; user?: User; message: string }> {
    return request<{ success: boolean; transaction: PaymentTransaction; user?: User; message: string }>(`/api/admin/payments/${params.transactionId}/refund`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async getUserTransactions(): Promise<{ transactions: PaymentTransaction[]; enrollments?: CourseEnrollment[] }> {
    return request<{ transactions: PaymentTransaction[]; enrollments?: CourseEnrollment[] }>('/api/user/transactions');
  },

  async checkoutCourse(params: {
    courseType: 'beginner' | 'advanced';
    paymentMethod: string;
    transactionReference?: string;
    senderAccount?: string;
    receiptUrl?: string;
    instantApprove?: boolean;
  }): Promise<{ success: boolean; message: string; user: User; transaction: PaymentTransaction; status: string }> {
    return request<{ success: boolean; message: string; user: User; transaction: PaymentTransaction; status: string }>('/api/user/payment/checkout', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Lessons
  async getLessons(level?: 'beginner' | 'advanced'): Promise<{ lessons: Lesson[] }> {
    const query = level ? `?level=${level}` : '';
    return request<{ lessons: Lesson[] }>(`/api/lessons${query}`);
  },

  async getLesson(id: string): Promise<{ lesson: Lesson }> {
    return request<{ lesson: Lesson }>(`/api/lessons/${id}`);
  },

  async createLesson(lesson: Partial<Lesson>): Promise<{ lesson: Lesson }> {
    return request<{ lesson: Lesson }>('/api/admin/lessons', {
      method: 'POST',
      body: JSON.stringify(lesson),
    });
  },

  async updateLesson(id: string, updates: Partial<Lesson>): Promise<{ lesson: Lesson }> {
    return request<{ lesson: Lesson }>(`/api/admin/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteLesson(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/admin/lessons/${id}`, {
      method: 'DELETE',
    });
  },

  // Live Classes
  async getLiveClasses(): Promise<{ liveClasses: LiveClass[] }> {
    return request<{ liveClasses: LiveClass[] }>('/api/live-classes');
  },

  async getLiveClass(id: string): Promise<{ liveClass: LiveClass }> {
    return request<{ liveClass: LiveClass }>(`/api/live-classes/${id}`);
  },

  async attendClass(id: string): Promise<{ liveClass: LiveClass }> {
    return request<{ liveClass: LiveClass }>(`/api/live-classes/${id}/attend`, {
      method: 'POST',
    });
  },

  async getClassChat(id: string): Promise<{ messages: LiveChatMessage[] }> {
    return request<{ messages: LiveChatMessage[] }>(`/api/live-classes/${id}/chat`);
  },

  async postChatMessage(id: string, text: string, isQuestion = false): Promise<{ message: LiveChatMessage }> {
    return request<{ message: LiveChatMessage }>(`/api/live-classes/${id}/chat`, {
      method: 'POST',
      body: JSON.stringify({ text, isQuestion }),
    });
  },

  async upvoteChatMessage(msgId: string): Promise<{ message: LiveChatMessage }> {
    return request<{ message: LiveChatMessage }>(`/api/live-classes/chat/${msgId}/upvote`, {
      method: 'POST',
    });
  },

  async createLiveClass(params: Partial<LiveClass>): Promise<{ liveClass: LiveClass }> {
    return request<{ liveClass: LiveClass }>('/api/admin/live-classes', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async updateLiveClass(id: string, updates: Partial<LiveClass>): Promise<{ liveClass: LiveClass }> {
    return request<{ liveClass: LiveClass }>(`/api/admin/live-classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteLiveClass(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/admin/live-classes/${id}`, {
      method: 'DELETE',
    });
  },

  // Spot Signals
  async getSpotSignals(): Promise<{ signals: SpotSignal[] }> {
    return request<{ signals: SpotSignal[] }>('/api/signals/spot');
  },

  async createSpotSignal(params: Partial<SpotSignal>): Promise<{ signal: SpotSignal }> {
    return request<{ signal: SpotSignal }>('/api/admin/signals/spot', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async updateSpotSignal(id: string, updates: Partial<SpotSignal>): Promise<{ signal: SpotSignal }> {
    return request<{ signal: SpotSignal }>(`/api/admin/signals/spot/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteSpotSignal(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/admin/signals/spot/${id}`, {
      method: 'DELETE',
    });
  },

  // Futures Signals
  async getFuturesSignals(): Promise<{ signals: FuturesSignal[] }> {
    return request<{ signals: FuturesSignal[] }>('/api/signals/futures');
  },

  async createFuturesSignal(params: Partial<FuturesSignal>): Promise<{ signal: FuturesSignal }> {
    return request<{ signal: FuturesSignal }>('/api/admin/signals/futures', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async updateFuturesSignal(id: string, updates: Partial<FuturesSignal>): Promise<{ signal: FuturesSignal }> {
    return request<{ signal: FuturesSignal }>(`/api/admin/signals/futures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteFuturesSignal(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/admin/signals/futures/${id}`, {
      method: 'DELETE',
    });
  },

  // Market Overview
  async getMarketOverview(): Promise<{
    tickers: MarketTicker[];
    stale: boolean;
    error: string | null;
    lastUpdate: string | null;
    provider: string;
  }> {
    return request('/api/market/overview');
  },

  // Reports
  async getReports(): Promise<{ reports: MarketAnalysisReport[] }> {
    return request<{ reports: MarketAnalysisReport[] }>('/api/reports');
  },

  async createReport(params: Partial<MarketAnalysisReport>): Promise<{ report: MarketAnalysisReport }> {
    return request<{ report: MarketAnalysisReport }>('/api/admin/reports', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async deleteReport(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/admin/reports/${id}`, {
      method: 'DELETE',
    });
  },

  // Materials
  async getMaterials(): Promise<{ materials: LearningMaterial[] }> {
    return request<{ materials: LearningMaterial[] }>('/api/materials');
  },

  async createMaterial(params: Partial<LearningMaterial>): Promise<{ material: LearningMaterial }> {
    return request<{ material: LearningMaterial }>('/api/admin/materials', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async deleteMaterial(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/admin/materials/${id}`, {
      method: 'DELETE',
    });
  },

  // Announcements
  async getAnnouncements(): Promise<{ announcements: Announcement[] }> {
    return request<{ announcements: Announcement[] }>('/api/announcements');
  },

  async createAnnouncement(params: Partial<Announcement>): Promise<{ announcement: Announcement }> {
    return request<{ announcement: Announcement }>('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async deleteAnnouncement(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin users
  async getAdminUsers(): Promise<{ users: User[] }> {
    return request<{ users: User[] }>('/api/admin/users');
  },

  async updateUserTier(id: string, tier: 'free' | 'premium'): Promise<{ user: User }> {
    return request<{ user: User }>(`/api/admin/users/${id}/tier`, {
      method: 'PUT',
      body: JSON.stringify({ tier }),
    });
  },

  async updateUserRole(id: string, role: 'admin' | 'student'): Promise<{ user: User }> {
    return request<{ user: User }>(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  async updateUserAccess(id: string, access: { hasBeginnerAccess?: boolean; hasAdvancedAccess?: boolean }): Promise<{ success: boolean; user: User }> {
    return request<{ success: boolean; user: User }>(`/api/admin/users/${id}/access`, {
      method: 'PUT',
      body: JSON.stringify(access),
    });
  },

  // Social Channels
  async getChannels(): Promise<{ channels: SocialChannel[] }> {
    return request<{ channels: SocialChannel[] }>('/api/channels');
  },

  async createChannel(params: Partial<SocialChannel>): Promise<{ channel: SocialChannel }> {
    return request<{ channel: SocialChannel }>('/api/admin/channels', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async updateChannel(id: string, updates: Partial<SocialChannel>): Promise<{ channel: SocialChannel }> {
    return request<{ channel: SocialChannel }>(`/api/admin/channels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteChannel(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/admin/channels/${id}`, {
      method: 'DELETE',
    });
  },

  // Community Polls & Lecture Portal
  async getPolls(): Promise<{ polls: CommunityPoll[] }> {
    return request<{ polls: CommunityPoll[] }>('/api/polls');
  },

  async votePoll(pollId: string, optionId: string): Promise<{ poll: CommunityPoll }> {
    return request<{ poll: CommunityPoll }>(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionId }),
    });
  },

  async createPoll(params: { title: string; description?: string; options: string[]; analysisDate?: string }): Promise<{ poll: CommunityPoll }> {
    return request<{ poll: CommunityPoll }>('/api/admin/polls', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async updatePoll(id: string, updates: Partial<CommunityPoll>): Promise<{ poll: CommunityPoll }> {
    return request<{ poll: CommunityPoll }>(`/api/admin/polls/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deletePoll(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/admin/polls/${id}`, {
      method: 'DELETE',
    });
  },
};
