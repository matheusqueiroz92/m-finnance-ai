export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    VERIFY_EMAIL: '/users/verify-email',
    RESEND_VERIFICATION: '/users/resend-verification',
    PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    GOOGLE: '/auth/google',
    FACEBOOK: '/auth/facebook',
    GITHUB: '/auth/github',
    SOCIAL_CALLBACK: '/auth/social-callback',
  },
  ACCOUNTS: {
    BASE: '/accounts',
    DETAIL: (id: string) => `/accounts/${id}`,
    SUMMARY: '/accounts/summary',
  },
  TRANSACTIONS: {
    BASE: '/transactions',
    DETAIL: (id: string) => `/transactions/${id}`,
    STATS: '/transactions/stats',
    ATTACHMENT: (transactionId: string, attachmentId: string) => 
      `/transactions/${transactionId}/attachments/${attachmentId}`,
  },
  CATEGORIES: {
    BASE: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
  },
  GOALS: {
    BASE: '/goals',
    DETAIL: (id: string) => `/goals/${id}`,
    STATS: '/goals/stats',
  },
  REPORTS: {
    GENERATE: '/reports/generate',
    INSIGHTS: '/reports/insights',
  },
  SUBSCRIPTIONS: {
    BASE: '/subscriptions',
    TRIAL: '/subscriptions/trial',
    CANCEL: '/subscriptions/cancel',
    PLAN: '/subscriptions/plan',
  },
  PAYMENTS: {
    CHECKOUT: '/payments/checkout',
    METHODS: '/payments/methods',
  },
  FILES: {
    AVATAR: (filename: string) => `/files/avatar/${filename}`,
    ATTACHMENT: (transactionId: string, attachmentId: string) => 
      `/files/attachment/${transactionId}/${attachmentId}`,
    DOWNLOAD: (transactionId: string, attachmentId: string) => 
      `/files/download/attachment/${transactionId}/${attachmentId}`,
  },
};