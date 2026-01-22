import axios from 'axios';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  MoodEntry,
  Activity,
  SleepEntry,
  Goal,
  Transaction,
  Budget,
  FinancialGoal,
  CategorySummary,
  Meal,
  Biometric,
  Exercise,
  HealthScore,
  WorkSession,
  Meeting,
  EnergyLevel,
  BoundaryViolation,
  WorkLifeBalance,
  Task,
  DeepWorkSession,
  ProductivityGoal,
  Distraction,
  ProductivityDashboard,
  Correlation,
  Insight,
  Recommendation,
  Prediction,
  DailyBriefing,
  WeeklyReview,
  WellbeingScore,
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data: RegisterData) =>
    api.post<User>('/auth/register', data),

  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),

  getCurrentUser: () =>
    api.get<User>('/auth/me'),
};

export const moodApi = {
  create: (data: Omit<MoodEntry, 'id' | 'created_at'>) =>
    api.post<MoodEntry>('/wellbeing/mood', data),

  getAll: (skip = 0, limit = 100) =>
    api.get<MoodEntry[]>(`/wellbeing/mood?skip=${skip}&limit=${limit}`),
};

export const activityApi = {
  create: (data: Omit<Activity, 'id' | 'created_at'>) =>
    api.post<Activity>('/wellbeing/activity', data),

  getAll: (skip = 0, limit = 100) =>
    api.get<Activity[]>(`/wellbeing/activity?skip=${skip}&limit=${limit}`),
};

export const sleepApi = {
  create: (data: Omit<SleepEntry, 'id' | 'created_at'>) =>
    api.post<SleepEntry>('/wellbeing/sleep', data),

  getAll: (skip = 0, limit = 100) =>
    api.get<SleepEntry[]>(`/wellbeing/sleep?skip=${skip}&limit=${limit}`),
};

export const goalApi = {
  create: (data: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Goal>('/wellbeing/goals', data),

  getAll: () =>
    api.get<Goal[]>('/wellbeing/goals'),

  update: (id: number, data: Partial<Goal>) =>
    api.put<Goal>(`/wellbeing/goals/${id}`, data),

  delete: (id: number) =>
    api.delete(`/wellbeing/goals/${id}`),
};

export const transactionApi = {
  create: (data: Omit<Transaction, 'id' | 'created_at'>) =>
    api.post<Transaction>('/financial/transactions', data),

  getAll: (skip = 0, limit = 100, category?: string, type?: string) => {
    let url = `/financial/transactions?skip=${skip}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    if (type) url += `&type=${type}`;
    return api.get<Transaction[]>(url);
  },

  update: (id: number, data: Partial<Transaction>) =>
    api.put<Transaction>(`/financial/transactions/${id}`, data),

  delete: (id: number) =>
    api.delete(`/financial/transactions/${id}`),

  getCategorySummary: () =>
    api.get<CategorySummary[]>('/financial/transactions/summary/categories'),
};

export const budgetApi = {
  create: (data: Omit<Budget, 'id' | 'created_at' | 'spent'>) =>
    api.post<Budget>('/financial/budgets', data),

  getAll: () =>
    api.get<Budget[]>('/financial/budgets'),

  update: (id: number, data: Partial<Budget>) =>
    api.put<Budget>(`/financial/budgets/${id}`, data),

  delete: (id: number) =>
    api.delete(`/financial/budgets/${id}`),
};

export const financialGoalApi = {
  create: (data: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<FinancialGoal>('/financial/goals', data),

  getAll: () =>
    api.get<FinancialGoal[]>('/financial/goals'),

  update: (id: number, data: Partial<FinancialGoal>) =>
    api.put<FinancialGoal>(`/financial/goals/${id}`, data),

  delete: (id: number) =>
    api.delete(`/financial/goals/${id}`),
};

export const mealApi = {
  create: (data: Omit<Meal, 'id' | 'created_at'>) =>
    api.post<Meal>('/health/meals', data),

  getAll: (skip = 0, limit = 100) =>
    api.get<Meal[]>(`/health/meals?skip=${skip}&limit=${limit}`),

  update: (id: number, data: Partial<Meal>) =>
    api.put<Meal>(`/health/meals/${id}`, data),

  delete: (id: number) =>
    api.delete(`/health/meals/${id}`),
};

export const biometricApi = {
  create: (data: Omit<Biometric, 'id' | 'created_at'>) =>
    api.post<Biometric>('/health/biometrics', data),

  getAll: (skip = 0, limit = 100, type?: string) => {
    let url = `/health/biometrics?skip=${skip}&limit=${limit}`;
    if (type) url += `&type=${type}`;
    return api.get<Biometric[]>(url);
  },

  update: (id: number, data: Partial<Biometric>) =>
    api.put<Biometric>(`/health/biometrics/${id}`, data),

  delete: (id: number) =>
    api.delete(`/health/biometrics/${id}`),
};

export const exerciseApi = {
  create: (data: Omit<Exercise, 'id' | 'created_at'>) =>
    api.post<Exercise>('/health/exercises', data),

  getAll: (skip = 0, limit = 100) =>
    api.get<Exercise[]>(`/health/exercises?skip=${skip}&limit=${limit}`),

  update: (id: number, data: Partial<Exercise>) =>
    api.put<Exercise>(`/health/exercises/${id}`, data),

  delete: (id: number) =>
    api.delete(`/health/exercises/${id}`),
};

export const healthScoreApi = {
  getCurrent: () =>
    api.get<HealthScore>('/health/score'),
};

export const workSessionApi = {
  create: (data: Omit<WorkSession, 'id' | 'created_at' | 'duration_minutes'>) =>
    api.post<WorkSession>('/worklife/sessions', data),

  getAll: (skip = 0, limit = 100) =>
    api.get<WorkSession[]>(`/worklife/sessions?skip=${skip}&limit=${limit}`),

  update: (id: number, data: Partial<WorkSession>) =>
    api.put<WorkSession>(`/worklife/sessions/${id}`, data),

  endSession: (id: number) =>
    api.post<WorkSession>(`/worklife/sessions/${id}/end`),

  delete: (id: number) =>
    api.delete(`/worklife/sessions/${id}`),
};

export const meetingApi = {
  create: (data: Omit<Meeting, 'id' | 'created_at' | 'duration_minutes'>) =>
    api.post<Meeting>('/worklife/meetings', data),

  getAll: (skip = 0, limit = 100) =>
    api.get<Meeting[]>(`/worklife/meetings?skip=${skip}&limit=${limit}`),

  update: (id: number, data: Partial<Meeting>) =>
    api.put<Meeting>(`/worklife/meetings/${id}`, data),

  delete: (id: number) =>
    api.delete(`/worklife/meetings/${id}`),
};

export const energyLevelApi = {
  create: (data: Omit<EnergyLevel, 'id' | 'created_at'>) =>
    api.post<EnergyLevel>('/worklife/energy', data),

  getAll: (skip = 0, limit = 100) =>
    api.get<EnergyLevel[]>(`/worklife/energy?skip=${skip}&limit=${limit}`),
};

export const boundaryViolationApi = {
  create: (data: Omit<BoundaryViolation, 'id' | 'created_at'>) =>
    api.post<BoundaryViolation>('/worklife/boundary-violations', data),

  getAll: (skip = 0, limit = 100) =>
    api.get<BoundaryViolation[]>(`/worklife/boundary-violations?skip=${skip}&limit=${limit}`),

  delete: (id: number) =>
    api.delete(`/worklife/boundary-violations/${id}`),
};

export const workLifeBalanceApi = {
  getCurrent: () =>
    api.get<WorkLifeBalance>('/worklife/balance'),
};

export const taskApi = {
  create: (data: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'actual_minutes'>) =>
    api.post<Task>('/productivity/tasks', data),

  getAll: (skip = 0, limit = 100, status?: string, priority?: string, project?: string) => {
    let url = `/productivity/tasks?skip=${skip}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (priority) url += `&priority=${priority}`;
    if (project) url += `&project=${project}`;
    return api.get<Task[]>(url);
  },

  get: (id: number) =>
    api.get<Task>(`/productivity/tasks/${id}`),

  update: (id: number, data: Partial<Task>) =>
    api.put<Task>(`/productivity/tasks/${id}`, data),

  delete: (id: number) =>
    api.delete(`/productivity/tasks/${id}`),
};

export const deepWorkApi = {
  create: (data: Omit<DeepWorkSession, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<DeepWorkSession>('/productivity/deepwork', data),

  getAll: (skip = 0, limit = 100) =>
    api.get<DeepWorkSession[]>(`/productivity/deepwork?skip=${skip}&limit=${limit}`),
};

export const distractionApi = {
  create: (data: Omit<Distraction, 'id' | 'created_at'>) =>
    api.post<Distraction>('/productivity/distractions', data),

  getAll: (skip = 0, limit = 100) =>
    api.get<Distraction[]>(`/productivity/distractions?skip=${skip}&limit=${limit}`),

  delete: (id: number) =>
    api.delete(`/productivity/distractions/${id}`),
};

export const productivityGoalApi = {
  create: (data: Omit<ProductivityGoal, 'id' | 'created_at' | 'updated_at' | 'current_value' | 'is_active' | 'is_completed'>) =>
    api.post<ProductivityGoal>('/productivity/goals', data),

  getAll: (skip = 0, limit = 100, activeOnly = false) =>
    api.get<ProductivityGoal[]>(`/productivity/goals?skip=${skip}&limit=${limit}&active_only=${activeOnly}`),

  update: (id: number, data: Partial<ProductivityGoal>) =>
    api.put<ProductivityGoal>(`/productivity/goals/${id}`, data),

  delete: (id: number) =>
    api.delete(`/productivity/goals/${id}`),
};

export const productivityDashboardApi = {
  get: (days = 30) =>
    api.get<ProductivityDashboard>(`/productivity/dashboard?days=${days}`),
};

// Intelligence API

export const correlationApi = {
  getAll: (days = 90) =>
    api.get<Correlation[]>(`/intelligence/correlations?days=${days}`),

  analyze: (pillars?: string[]) =>
    api.post<Correlation[]>('/intelligence/correlations/analyze', { pillars }),
};

export const insightApi = {
  getAll: (timePeriod?: string, pillar?: string, severity?: string) => {
    let url = '/intelligence/insights?';
    if (timePeriod) url += `time_period=${timePeriod}&`;
    if (pillar) url += `pillar=${pillar}&`;
    if (severity) url += `severity=${severity}&`;
    return api.get<Insight[]>(url);
  },

  getUnread: () =>
    api.get<Insight[]>('/intelligence/insights/unread'),

  markAsRead: (id: number) =>
    api.put(`/intelligence/insights/${id}/read`, {}),
};

export const recommendationApi = {
  getAll: (pillar?: string, status?: string) => {
    let url = '/intelligence/recommendations?';
    if (pillar) url += `pillar=${pillar}&`;
    if (status) url += `status=${status}&`;
    return api.get<Recommendation[]>(url);
  },

  update: (id: number, data: Partial<Recommendation>) =>
    api.put<Recommendation>(`/intelligence/recommendations/${id}`, data),

  generate: () =>
    api.post<Recommendation[]>('/intelligence/recommendations/generate', {}),
};

export const predictionApi = {
  getAll: (type?: string) => {
    let url = '/intelligence/predictions?';
    if (type) url += `type=${type}`;
    return api.get<Prediction[]>(url);
  },

  generate: (predictionType: string) =>
    api.post<Prediction>('/intelligence/predictions/generate', { prediction_type: predictionType }),
};

export const dailyBriefingApi = {
  get: (date?: string) => {
    let url = '/intelligence/briefing';
    if (date) url += `?date=${date}`;
    return api.get<DailyBriefing>(url);
  },

  generate: () =>
    api.post<DailyBriefing>('/intelligence/briefing/generate', {}),
};

export const weeklyReviewApi = {
  get: (week?: string) => {
    let url = '/intelligence/weekly-review';
    if (week) url += `?week=${week}`;
    return api.get<WeeklyReview>(url);
  },

  getLatest: () =>
    api.get<WeeklyReview>('/intelligence/weekly-review/latest'),
};

export const wellbeingScoreApi = {
  get: () =>
    api.get<WellbeingScore>('/intelligence/wellbeing-score'),
};

export default api;
