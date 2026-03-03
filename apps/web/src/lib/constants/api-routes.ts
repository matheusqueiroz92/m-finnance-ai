// Sempre usar proxy /api (same-origin) para o cookie HttpOnly ser enviado e recebido corretamente
export const API_BASE_URL =
  typeof window !== "undefined" ? "/api" : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/users/login",
    REGISTER: "/users/register",
    LOGOUT: "/users/logout",
    VERIFY_EMAIL: "/auth/verify-email-public",
    RESEND_VERIFICATION: "/auth/resend-verification",
    PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/users/change-password",
    FORGOT_PASSWORD: "/users/forgot-password",
    RESET_PASSWORD: "/users/reset-password",
    GOOGLE: "/auth/google",
    FACEBOOK: "/auth/facebook",
    GITHUB: "/auth/github",
    SOCIAL_CALLBACK: "/auth/social-callback",
  },

  ACCOUNTS: {
    BASE: "/accounts",
    DETAIL: (id: string) => `/accounts/${id}`,
    SUMMARY: "/accounts/summary",
  },

  CONTACT: {
    SEND: "/contact/send",
    SUPPORT: "/contact/support",
    FEEDBACK: "/contact/feedback",
  },

  TRANSACTIONS: {
    BASE: "/transactions",
    DETAIL: (id: string) => `/transactions/${id}`,
    STATS: "/transactions/stats",
    ATTACHMENT: (transactionId: string, attachmentId: string) =>
      `/transactions/${transactionId}/attachments/${attachmentId}`,
  },

  CREDIT_CARDS: {
    BASE: "/credit-cards",
    DETAIL: (id: string) => `/credit-cards/${id}`,
    SUMMARY: "/credit-cards/summary",
    BILLINGS: "/credit-cards/billings",
    VALIDATE_SECURITY_CODE: (id: string) =>
      `/credit-cards/${id}/validate-security-code`,
  },

  CATEGORIES: {
    BASE: "/categories",
    DETAIL: (id: string) => `/categories/${id}`,
  },

  GOALS: {
    BASE: "/goals",
    DETAIL: (id: string) => `/goals/${id}`,
    STATS: "/goals/stats",
  },

  INVESTMENTS: {
    BASE: "/investments",
    DETAIL: (id: string) => `/investments/${id}`,
    SUMMARY: "/investments/summary",
    PERFORMANCE: "/investments/performance",
    RECOMMENDATIONS: "/investments/recommendations",
  },

  REPORTS: {
    BASE: "/reports",
    GENERATE: "/reports/generate",
    INSIGHTS: "/reports/insights",
  },

  PLANNING: {
    BASE: "/planning",
    PLAN: "/planning/plan",
    SIMULATE: "/planning/simulate",
    ADHERENCE: "/planning/adherence",
  },

  CONSULTANT: {
    BASE: "/consultant",
    CHAT: "/consultant/chat",
    SESSIONS: "/consultant/sessions",
    SESSION_DETAIL: (id: string) => `/consultant/sessions/${id}`,
  },

  SUBSCRIPTIONS: {
    BASE: "/subscriptions",
    TRIAL: "/subscriptions/trial",
    CANCEL: "/subscriptions/cancel",
    PLAN: "/subscriptions/plan",
  },

  PAYMENTS: {
    CHECKOUT: "/payments/checkout",
    METHODS: "/payments/methods",
  },

  NOTIFICATIONS: {
    BASE: "/notifications",
    MARK_AS_READ: (id: string) => `/notifications/${id}/mark-as-read`,
    MARK_ALL_AS_READ: "/notifications/mark-all-as-read",
  },

  FILES: {
    AVATAR: (filename: string) => `/files/avatar/${filename}`,
    ATTACHMENT: (transactionId: string, attachmentId: string) =>
      `/files/attachment/${transactionId}/${attachmentId}`,
    DOWNLOAD: (transactionId: string, attachmentId: string) =>
      `/files/download/attachment/${transactionId}/${attachmentId}`,
  },
};
