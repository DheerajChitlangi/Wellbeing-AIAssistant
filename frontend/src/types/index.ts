export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface MoodEntry {
  id?: number;
  mood_score: number;
  energy_level: number;
  stress_level: number;
  notes?: string;
  created_at?: string;
}

export interface Activity {
  id?: number;
  activity_type: string;
  duration_minutes: number;
  intensity?: string;
  notes?: string;
  created_at?: string;
}

export interface SleepEntry {
  id?: number;
  sleep_hours: number;
  sleep_quality: number;
  bedtime?: string;
  wake_time?: string;
  notes?: string;
  created_at?: string;
}

export interface Goal {
  id?: number;
  title: string;
  description?: string;
  target_date?: string;
  is_completed?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id?: number;
  amount: number;
  category: string;
  description: string;
  transaction_type: 'income' | 'expense';
  date: string;
  created_at?: string;
}

export interface Budget {
  id?: number;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  spent?: number;
  created_at?: string;
}

export interface FinancialGoal {
  id?: number;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  transaction_count: number;
}

export interface Meal {
  id?: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_items: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  photo_url?: string;
  notes?: string;
  meal_time: string;
  created_at?: string;
}

export interface Biometric {
  id?: number;
  metric_type: 'weight' | 'blood_pressure' | 'heart_rate' | 'glucose' | 'temperature';
  value: number;
  value_secondary?: number;
  unit: string;
  measured_at: string;
  notes?: string;
  created_at?: string;
}

export interface Exercise {
  id?: number;
  exercise_type: string;
  duration_minutes: number;
  calories_burned?: number;
  intensity: 'low' | 'medium' | 'high';
  distance?: number;
  notes?: string;
  performed_at: string;
  created_at?: string;
}

export interface HealthScore {
  overall_score: number;
  nutrition_score: number;
  activity_score: number;
  sleep_score: number;
  biometric_score: number;
  factors: {
    category: string;
    score: number;
    trend: 'improving' | 'stable' | 'declining';
    recommendation: string;
  }[];
}

export interface WorkSession {
  id?: number;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  session_type: 'work' | 'meeting' | 'break' | 'focus';
  productivity_rating?: number;
  notes?: string;
  created_at?: string;
}

export interface Meeting {
  id?: number;
  title: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  attendees_count?: number;
  is_necessary?: boolean;
  meeting_type: 'one-on-one' | 'team' | 'all-hands' | 'external';
  notes?: string;
  created_at?: string;
}

export interface EnergyLevel {
  id?: number;
  energy_score: number;
  focus_score: number;
  motivation_score: number;
  recorded_at: string;
  context?: string;
  created_at?: string;
}

export interface BoundaryViolation {
  id?: number;
  violation_type: 'after_hours_work' | 'weekend_work' | 'missed_break' | 'overtime' | 'vacation_interruption';
  occurred_at: string;
  duration_minutes?: number;
  severity: 'low' | 'medium' | 'high';
  notes?: string;
  created_at?: string;
}

export interface WorkLifeBalance {
  balance_score: number;
  burnout_risk: 'low' | 'medium' | 'high';
  work_hours_weekly: number;
  meeting_hours_weekly: number;
  boundary_violations_count: number;
  recommendations: string[];
  trends: {
    metric: string;
    trend: 'improving' | 'stable' | 'worsening';
    value: number;
  }[];
}

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project?: string;
  category?: string;
  estimated_minutes?: number;
  actual_minutes?: number;
  due_date?: string;
  completed_at?: string;
  parent_task_id?: number;
  tags?: string;
  energy_required?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DeepWorkSession {
  id?: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  task_id?: number;
  project?: string;
  focus_score: number;
  interruptions: number;
  context?: string;
  energy_before?: number;
  energy_after?: number;
  output_quality?: number;
  was_planned: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductivityGoal {
  id?: number;
  title: string;
  description?: string;
  goal_type: string;
  metric: string;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  is_completed: boolean;
  priority: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Distraction {
  id?: number;
  distraction_type: 'social_media' | 'email' | 'chat' | 'phone' | 'noise' | 'people' | 'thoughts' | 'other';
  description: string;
  timestamp: string;
  duration_minutes?: number;
  impact: number;
  deep_work_session_id?: number;
  task_id?: number;
  was_avoidable?: boolean;
  prevention_strategy?: string;
  created_at?: string;
}

export interface ProductivityDashboard {
  productivity_score: number;
  tasks_completed: number;
  tasks_total: number;
  completion_rate: number;
  deep_work_hours: number;
  avg_focus_score: number;
  context_switches: number;
  avg_distraction_impact: number;
  peak_hours: {
    hour: number;
    score: number;
  }[];
  days_analyzed: number;
}

// Intelligence Layer Types

export interface Correlation {
  id: number;
  pillar_1: string;
  metric_1: string;
  pillar_2: string;
  metric_2: string;
  correlation_coefficient: number;
  p_value: number;
  sample_size: number;
  strength: 'weak' | 'moderate' | 'strong';
  direction: 'positive' | 'negative';
  insight?: string;
  is_significant: boolean;
  discovered_at: string;
}

export interface Insight {
  id: number;
  insight_type: 'trend' | 'anomaly' | 'achievement' | 'warning';
  pillar: 'financial' | 'health' | 'worklife' | 'productivity' | 'cross-pillar';
  title: string;
  description: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  data_points?: Record<string, any>;
  time_period: string;
  confidence_score?: number;
  is_read: boolean;
  created_at: string;
}

export interface Recommendation {
  id: number;
  pillar: string;
  category: string;
  title: string;
  description: string;
  action_items: string[];
  priority: number;
  expected_impact: 'low' | 'medium' | 'high';
  estimated_effort: 'low' | 'medium' | 'high';
  reasoning?: string;
  status: 'pending' | 'accepted' | 'dismissed' | 'completed';
  is_active: boolean;
  created_at: string;
}

export interface Prediction {
  id: number;
  prediction_type: 'goal_achievement' | 'burnout' | 'health_trend';
  pillar: string;
  target_metric: string;
  current_value: number;
  predicted_value: number;
  target_date: string;
  confidence_level: number;
  factors: Record<string, any>;
  trend_direction: 'improving' | 'stable' | 'declining';
  likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  recommendations?: string[];
  created_at: string;
}

export interface DailyBriefing {
  id: number;
  briefing_date: string;
  summary: string;
  top_priorities: Array<{
    title: string;
    pillar: string;
    importance: number;
    action: string;
  }>;
  key_metrics: Record<string, any>;
  alerts?: Array<{
    severity: string;
    message: string;
    pillar: string;
  }>;
  motivational_message?: string;
  insights_count: number;
  recommendations_count: number;
  is_viewed: boolean;
  created_at: string;
}

export interface WeeklyReview {
  id: number;
  week_start: string;
  week_end: string;
  overall_score: number;
  executive_summary: string;
  financial_summary: Record<string, any>;
  health_summary: Record<string, any>;
  worklife_summary: Record<string, any>;
  productivity_summary: Record<string, any>;
  wins: string[];
  concerns: string[];
  action_items: string[];
  trends: Record<string, any>;
  correlations?: Record<string, any>;
  goals_progress: Record<string, any>;
  goals_on_track: number;
  goals_at_risk: number;
  next_week_forecast?: Record<string, any>;
  is_viewed: boolean;
  created_at: string;
}

export interface WellbeingScore {
  overall_score: number;
  financial_score: number;
  health_score: number;
  worklife_score: number;
  productivity_score: number;
  trend: 'improving' | 'stable' | 'declining';
  last_updated: string;
}
