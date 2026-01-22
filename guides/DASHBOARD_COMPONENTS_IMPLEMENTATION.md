# Main Dashboard & Agentic Features - Complete Implementation Guide

## Overview
This document provides complete specifications for the main dashboard and all AI-powered intelligence features that bring the Wellbeing Copilot to life.

## Component Architecture

```
src/
├── pages/
│   ├── MainDashboard.tsx           # Overview of all pillars
│   ├── DailyBriefingPage.tsx       # Morning summary
│   ├── WeeklyReviewPage.tsx        # Comprehensive weekly report
│   └── IntelligencePage.tsx        # Intelligence hub
├── components/
│   └── intelligence/
│       ├── CorrelationsView.tsx    # Discovered patterns
│       ├── RecommendationsCenter.tsx # AI suggestions
│       ├── InsightsTimeline.tsx    # Chronological insights
│       ├── PillarScoreCard.tsx     # Individual pillar cards
│       ├── MetricTrendChart.tsx    # Trend visualization
│       └── index.ts
```

## 1. MainDashboard Component

### Purpose
Unified overview of all 4 wellbeing pillars with real-time insights and actionable intelligence.

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  Welcome back, [Name]! 🌟                      [Date]   │
│  Your Wellbeing Score: 78/100 (↑ 5 from last week)     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Financial │ │  Health  │ │Work-Life │ │Productiv.│  │
│  │   75/100 │ │   82/100 │ │   71/100 │ │   80/100 │  │
│  │    ↗️     │ │    ➡️     │ │    ↘️     │ │    ↗️     │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────────────────┤
│  📊 Key Insights (4)              🎯 Action Items (6)   │
│  • Sleep quality improving        • Review budget       │
│  • Work hours trending high       • Schedule break      │
│  • Exercise streak: 7 days!       • Complete task X     │
├─────────────────────────────────────────────────────────┤
│  📈 Trends This Week              🔗 Correlations (2)   │
│  [Multi-line chart]               • Exercise ↔ Mood     │
│                                   • Work ↔ Sleep        │
└─────────────────────────────────────────────────────────┘
```

### Features & Implementation

#### A. Overall Wellbeing Score
```typescript
interface WellbeingScore {
  overall: number;          // 0-100
  financial: number;
  health: number;
  worklife: number;
  productivity: number;
  trend: 'up' | 'down' | 'stable';
  weekChange: number;
}

// Calculation Algorithm:
const calculateOverallScore = (scores: PillarScores) => {
  return (
    scores.financial * 0.25 +
    scores.health * 0.30 +
    scores.worklife * 0.25 +
    scores.productivity * 0.20
  );
};
```

#### B. Pillar Score Cards
```typescript
interface PillarCard {
  pillar: 'financial' | 'health' | 'worklife' | 'productivity';
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  keyMetric: {
    label: string;
    value: string;
    status: 'good' | 'warning' | 'critical';
  };
  recentInsights: Insight[];
  quickActions: Action[];
}

// Example Pillar Card
<PillarScoreCard
  pillar="health"
  score={82}
  trend="improving"
  keyMetric={{
    label: "Sleep Quality",
    value: "7.5/10",
    status: "good"
  }}
  onClick={() => navigate('/health')}
/>
```

#### C. Key Insights Section
```typescript
// Display most important insights from last 24h
const KeyInsights = () => {
  const insights = useFetchInsights({
    timeRange: '24h',
    severity: ['high', 'critical'],
    limit: 4
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights.map(insight => (
        <InsightCard
          key={insight.id}
          insight={insight}
          compact={true}
        />
      ))}
    </div>
  );
};
```

#### D. Action Items
```typescript
// Prioritized action items from recommendations
const ActionItems = () => {
  const recommendations = useFetchRecommendations({
    status: 'pending',
    sortBy: 'priority',
    limit: 6
  });

  return (
    <div className="space-y-2">
      {recommendations.map(rec => (
        <ActionItem
          key={rec.id}
          title={rec.title}
          pillar={rec.pillar}
          priority={rec.priority}
          effort={rec.estimated_effort}
          onComplete={() => completeAction(rec.id)}
        />
      ))}
    </div>
  );
};
```

#### E. Trends Visualization
```typescript
// Multi-line chart showing all pillar trends
const TrendsChart = () => {
  const trendsData = useFetchTrends({ days: 30 });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={trendsData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="financial" stroke="#10b981" strokeWidth={2} />
        <Line type="monotone" dataKey="health" stroke="#3b82f6" strokeWidth={2} />
        <Line type="monotone" dataKey="worklife" stroke="#f59e0b" strokeWidth={2} />
        <Line type="monotone" dataKey="productivity" stroke="#8b5cf6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

#### F. Discovered Correlations
```typescript
const CorrelationsPreview = () => {
  const correlations = useFetchCorrelations({
    minStrength: 'moderate',
    significant: true,
    limit: 3
  });

  return (
    <div className="space-y-3">
      {correlations.map(corr => (
        <CorrelationCard
          key={corr.id}
          correlation={corr}
          showDetails={false}
          onClick={() => navigate('/intelligence/correlations')}
        />
      ))}
    </div>
  );
};
```

---

## 2. DailyBriefing Component

### Purpose
Personalized morning summary powered by AI to start the day with clarity and focus.

### Layout
```
┌─────────────────────────────────────────────┐
│  ☀️ Good Morning, [Name]!                   │
│  [Current Date & Time]                      │
├─────────────────────────────────────────────┤
│  📋 Your Day at a Glance                    │
│  ─────────────────────────────────          │
│  [AI-Generated Executive Summary]           │
│  - 2-3 sentences about overall status       │
│  - Key things to know today                 │
├─────────────────────────────────────────────┤
│  🎯 Top 3 Priorities                        │
│  ─────────────────────────────────          │
│  1. [Priority with pillar badge]            │
│  2. [Priority with pillar badge]            │
│  3. [Priority with pillar badge]            │
├─────────────────────────────────────────────┤
│  📊 Today's Key Metrics                     │
│  ─────────────────────────────────          │
│  💰 Budget: $X remaining    ⏰ Work: Xh     │
│  😴 Sleep: X.Xh              ✅ Tasks: X     │
├─────────────────────────────────────────────┤
│  ⚠️ Alerts & Warnings (2)                   │
│  ─────────────────────────────────          │
│  • [Critical alert with action button]      │
│  • [Warning with details]                   │
├─────────────────────────────────────────────┤
│  💪 Motivational Message                    │
│  ─────────────────────────────────          │
│  [AI-generated encouragement based on       │
│   recent trends and achievements]           │
├─────────────────────────────────────────────┤
│  [View Full Insights] [Start My Day]        │
└─────────────────────────────────────────────┘
```

### Features

#### A. AI-Generated Summary
```typescript
interface DailyBriefing {
  date: Date;
  summary: string;                    // AI-generated
  topPriorities: Priority[];
  keyMetrics: KeyMetrics;
  alerts: Alert[];
  motivationalMessage: string;        // AI-generated
  insightsCount: number;
  recommendationsCount: number;
}

// Fetch or generate briefing
const useDailyBriefing = (date: Date) => {
  return useQuery(['dailyBriefing', date], async () => {
    // Check if briefing exists for today
    let briefing = await fetchBriefing(date);

    // Generate if doesn't exist
    if (!briefing) {
      briefing = await generateBriefing(date);
    }

    return briefing;
  });
};
```

#### B. Priority Generation
```typescript
// Determine top priorities for the day
const generatePriorities = (data: UserData): Priority[] => {
  const priorities: Priority[] = [];

  // Urgent tasks due today
  const urgentTasks = data.tasks.filter(t =>
    t.dueDate === today && t.priority === 'urgent'
  );

  // High-impact recommendations
  const highImpactRecs = data.recommendations.filter(r =>
    r.expectedImpact === 'high' && r.priority >= 4
  );

  // Critical alerts
  const criticalAlerts = data.insights.filter(i =>
    i.severity === 'critical'
  );

  // Combine and rank
  return rankByImportance([
    ...urgentTasks,
    ...highImpactRecs,
    ...criticalAlerts
  ]).slice(0, 3);
};
```

#### C. Real-time Metrics
```typescript
const TodaysMetrics = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        icon="💰"
        label="Budget Remaining"
        value="$1,247"
        status="good"
        pillar="financial"
      />
      <MetricCard
        icon="⏰"
        label="Work Hours Today"
        value="3.5h / 8h"
        status="good"
        pillar="worklife"
      />
      <MetricCard
        icon="😴"
        label="Last Night's Sleep"
        value="7.2h"
        status="good"
        pillar="health"
      />
      <MetricCard
        icon="✅"
        label="Tasks Completed"
        value="5 / 12"
        status="warning"
        pillar="productivity"
      />
    </div>
  );
};
```

---

## 3. CorrelationsView Component

### Purpose
Interactive visualization of discovered patterns and relationships between metrics.

### Layout
```
┌─────────────────────────────────────────────────────┐
│  🔗 Discovered Correlations & Patterns              │
│  [Filter by Pillar] [Filter by Strength]            │
├─────────────────────────────────────────────────────┤
│  📊 Correlation Matrix Heatmap                      │
│  ┌─────────────────────────────────────────────┐   │
│  │         Fin  Health  Work  Prod             │   │
│  │  Fin     -    0.42   0.18  0.33             │   │
│  │  Health 0.42   -     0.67  0.58             │   │
│  │  Work   0.18  0.67    -    0.45             │   │
│  │  Prod   0.33  0.58   0.45   -               │   │
│  └─────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  💡 Significant Correlations                        │
│  ─────────────────────────────────────              │
│  ┌───────────────────────────────────────────┐     │
│  │ Sleep Quality ↔ Productivity              │     │
│  │ Strength: Strong (0.67) ✓ Significant     │     │
│  │ [Scatter Plot Visualization]               │     │
│  │ Insight: Your productivity increases 25%   │     │
│  │ with 7+ hours of quality sleep.            │     │
│  │ [View Details] [Apply Recommendation]      │     │
│  └───────────────────────────────────────────┘     │
│  [More correlations...]                             │
└─────────────────────────────────────────────────────┘
```

### Features

#### A. Interactive Heatmap
```typescript
const CorrelationHeatmap = ({ correlations }: Props) => {
  // Transform correlations into matrix format
  const matrix = buildCorrelationMatrix(correlations);

  return (
    <div className="correlation-heatmap">
      {matrix.map((row, i) => (
        <div key={i} className="flex">
          {row.map((cell, j) => (
            <div
              key={j}
              className={getHeatmapColor(cell.value)}
              onClick={() => showCorrelationDetails(cell)}
              title={`${cell.metric1} ↔ ${cell.metric2}: ${cell.value}`}
            >
              {cell.value.toFixed(2)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const getHeatmapColor = (value: number) => {
  const abs = Math.abs(value);
  if (abs < 0.3) return 'bg-gray-200';
  if (abs < 0.5) return 'bg-blue-300';
  if (abs < 0.7) return 'bg-blue-500';
  return 'bg-blue-700';
};
```

#### B. Correlation Details
```typescript
const CorrelationDetail = ({ correlation }: Props) => {
  // Prepare scatter plot data
  const scatterData = prepareScatterData(
    correlation.metric1Data,
    correlation.metric2Data
  );

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">
            {correlation.metric1} ↔ {correlation.metric2}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <Badge color={getStrengthColor(correlation.strength)}>
              {correlation.strength.toUpperCase()}
            </Badge>
            <span className="text-sm">
              r = {correlation.coefficient.toFixed(3)}
            </span>
            {correlation.isSignificant && (
              <span className="text-green-600 text-sm">✓ Significant</span>
            )}
          </div>
        </div>
        <DirectionIndicator direction={correlation.direction} />
      </div>

      {/* Scatter Plot */}
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid />
          <XAxis dataKey="x" name={correlation.metric1} />
          <YAxis dataKey="y" name={correlation.metric2} />
          <Tooltip />
          <Scatter data={scatterData} fill="#3b82f6" />
        </ScatterChart>
      </ResponsiveContainer>

      {/* AI Insight */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm font-medium text-blue-900 mb-2">
          💡 What This Means
        </p>
        <p className="text-sm text-blue-800">
          {correlation.insight}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <button className="btn-primary">Apply Recommendation</button>
        <button className="btn-secondary">Learn More</button>
      </div>
    </div>
  );
};
```

---

## 4. RecommendationsCenter Component

### Purpose
Centralized hub for all AI-generated recommendations with tracking and feedback.

### Layout
```
┌─────────────────────────────────────────────────────┐
│  🎯 Recommendations Center                          │
│  [All] [Financial] [Health] [Work-Life] [Product.]  │
│  [Sort: Priority ▼] [Filter: Active ▼]             │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐ │
│  │ 🔥 HIGH PRIORITY                              │ │
│  │ Reduce Meeting Load by 30%                    │ │
│  │ Work-Life • High Impact • Medium Effort       │ │
│  │                                                │ │
│  │ Reasoning: Your meeting hours are 50% above   │ │
│  │ healthy levels, correlating with decreased    │ │
│  │ focus time and increased burnout risk.        │ │
│  │                                                │ │
│  │ Action Items:                                  │ │
│  │ ☐ Decline non-essential recurring meetings    │ │
│  │ ☐ Set "No meeting Fridays" policy             │ │
│  │ ☐ Block 2hr focus time daily                  │ │
│  │                                                │ │
│  │ Expected Impact: +40% focus time, -20% stress │ │
│  │                                                │ │
│  │ [Accept] [Dismiss] [Already Doing This]       │ │
│  └───────────────────────────────────────────────┘ │
│  [More recommendations...]                          │
└─────────────────────────────────────────────────────┘
```

### Features

#### A. Recommendation Card
```typescript
interface Recommendation {
  id: number;
  pillar: Pillar;
  category: string;
  title: string;
  description: string;
  actionItems: string[];
  priority: 1 | 2 | 3 | 4 | 5;
  expectedImpact: 'low' | 'medium' | 'high';
  estimatedEffort: 'low' | 'medium' | 'high';
  reasoning: string;
  relatedInsights: number[];
  status: 'pending' | 'accepted' | 'dismissed' | 'completed';
  createdAt: Date;
}

const RecommendationCard = ({ recommendation, onUpdate }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [checklistState, setChecklistState] = useState<boolean[]>([]);

  return (
    <div className={`recommendation-card priority-${recommendation.priority}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <PriorityBadge priority={recommendation.priority} />
            <PillarBadge pillar={recommendation.pillar} />
          </div>
          <h3 className="text-lg font-bold">{recommendation.title}</h3>
          <div className="flex gap-3 mt-2 text-sm">
            <ImpactBadge impact={recommendation.expectedImpact} />
            <EffortBadge effort={recommendation.estimatedEffort} />
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)}>
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <>
          {/* Reasoning */}
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm font-medium mb-1">Why this matters:</p>
            <p className="text-sm text-gray-700">{recommendation.reasoning}</p>
          </div>

          {/* Action Items Checklist */}
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Action Steps:</p>
            {recommendation.actionItems.map((item, idx) => (
              <label key={idx} className="flex items-start gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={checklistState[idx]}
                  onChange={() => toggleActionItem(idx)}
                  className="mt-1"
                />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>

          {/* Expected Impact */}
          <div className="mt-4 p-3 bg-green-50 rounded">
            <p className="text-sm font-medium text-green-900">
              Expected Impact: {recommendation.description}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onUpdate(recommendation.id, { status: 'accepted' })}
              className="btn-primary flex-1"
            >
              Accept & Track
            </button>
            <button
              onClick={() => onUpdate(recommendation.id, { status: 'dismissed' })}
              className="btn-secondary"
            >
              Dismiss
            </button>
            <button
              onClick={() => onUpdate(recommendation.id, { status: 'completed' })}
              className="btn-success"
            >
              Already Doing This
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

#### B. Impact vs Effort Matrix
```typescript
const ImpactEffortMatrix = ({ recommendations }: Props) => {
  const matrix = categorizeByImpactEffort(recommendations);

  return (
    <div className="grid grid-cols-3 gap-4 h-96">
      {/* High Impact, Low Effort - QUICK WINS */}
      <div className="bg-green-100 rounded p-4 col-span-1 row-span-1">
        <h4 className="font-bold text-green-900">🎯 Quick Wins</h4>
        <p className="text-xs text-green-700">High Impact, Low Effort</p>
        <div className="mt-2 space-y-2">
          {matrix.quickWins.map(rec => (
            <MiniRecCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </div>

      {/* High Impact, High Effort - MAJOR PROJECTS */}
      <div className="bg-blue-100 rounded p-4 col-span-1 row-span-1">
        <h4 className="font-bold text-blue-900">🚀 Major Projects</h4>
        <p className="text-xs text-blue-700">High Impact, High Effort</p>
        {/* recommendations */}
      </div>

      {/* Low Impact, Low Effort - FILL INS */}
      <div className="bg-gray-100 rounded p-4 col-span-1 row-span-1">
        <h4 className="font-bold text-gray-900">📝 Fill-Ins</h4>
        <p className="text-xs text-gray-700">Low Impact, Low Effort</p>
        {/* recommendations */}
      </div>
    </div>
  );
};
```

---

## 5. WeeklyReviewPage Component

### Purpose
Comprehensive weekly analysis with AI-generated narrative and actionable insights.

### Layout
```
┌─────────────────────────────────────────────────────┐
│  📅 Weekly Review: [Week Start] - [Week End]        │
│  Overall Score: 78/100 (↑ 5 from last week)         │
├─────────────────────────────────────────────────────┤
│  📝 Executive Summary                               │
│  ─────────────────────────────────────              │
│  [AI-generated narrative summary of the week]       │
│  - Key themes                                       │
│  - Notable patterns                                 │
│  - Overall trajectory                               │
├─────────────────────────────────────────────────────┤
│  🎉 Wins This Week (5)                              │
│  ─────────────────────────────────────              │
│  • Exercise streak: 7 days! 💪                      │
│  • Saved $500 over budget 💰                        │
│  • Zero after-hours work 🎯                         │
│  • [More wins...]                                   │
├─────────────────────────────────────────────────────┤
│  ⚠️ Areas for Improvement (3)                       │
│  ─────────────────────────────────────              │
│  • Sleep quality declined                           │
│  • Meeting load increased 40%                       │
│  • [More concerns...]                               │
├─────────────────────────────────────────────────────┤
│  📊 Pillar-by-Pillar Analysis                       │
│  ─────────────────────────────────────              │
│  [4 tabs: Financial | Health | Work-Life | Product.]│
│  [Detailed charts and metrics for selected pillar]  │
├─────────────────────────────────────────────────────┤
│  📈 Trends & Patterns                               │
│  [Multi-line chart showing all pillars over time]   │
├─────────────────────────────────────────────────────┤
│  🎯 Action Items for Next Week                      │
│  ─────────────────────────────────────              │
│  1. [Priority action item]                          │
│  2. [Priority action item]                          │
│  3. [Priority action item]                          │
├─────────────────────────────────────────────────────┤
│  [Export PDF] [Share] [View Previous Week]          │
└─────────────────────────────────────────────────────┘
```

### Implementation

```typescript
interface WeeklyReview {
  weekStart: Date;
  weekEnd: Date;
  overallScore: number;
  executiveSummary: string;                // AI-generated

  wins: string[];
  concerns: string[];
  actionItems: string[];

  financial: PillarSummary;
  health: PillarSummary;
  worklife: PillarSummary;
  productivity: PillarSummary;

  trends: TrendData;
  correlations: Correlation[];
  goalsProgress: GoalProgress[];
  nextWeekForecast: Forecast;
}

const WeeklyReviewPage = () => {
  const { week } = useParams();
  const review = useFetchWeeklyReview(week);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <WeeklyReviewHeader review={review} />

      {/* Executive Summary */}
      <ExecutiveSummarySection summary={review.executiveSummary} />

      {/* Wins & Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WinsSection wins={review.wins} />
        <ConcernsSection concerns={review.concerns} />
      </div>

      {/* Pillar Analysis Tabs */}
      <PillarAnalysisTabs
        financial={review.financial}
        health={review.health}
        worklife={review.worklife}
        productivity={review.productivity}
      />

      {/* Trends Chart */}
      <TrendsSection trends={review.trends} />

      {/* Goals Progress */}
      <GoalsProgressSection goals={review.goalsProgress} />

      {/* Action Items */}
      <ActionItemsSection items={review.actionItems} />

      {/* Export & Share */}
      <div className="flex gap-4">
        <button onClick={() => exportPDF(review)}>
          📄 Export PDF
        </button>
        <button onClick={() => shareReview(review)}>
          🔗 Share
        </button>
      </div>
    </div>
  );
};
```

---

## 6. InsightsTimeline Component

### Purpose
Chronological feed of all insights with filtering and celebration features.

### Layout
```
┌─────────────────────────────────────────────────────┐
│  💡 Insights Timeline                               │
│  [All] [Trends] [Anomalies] [Achievements]          │
│  [Financial] [Health] [Work-Life] [Productivity]    │
├─────────────────────────────────────────────────────┤
│  Today                                              │
│  ─────                                              │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🎉 ACHIEVEMENT • Health • 2h ago              │ │
│  │ 7-Day Exercise Streak!                         │ │
│  │                                                │ │
│  │ You've exercised consistently for 7 days.     │ │
│  │ Your energy levels are up 25% and sleep       │ │
│  │ quality improved by 15%.                       │ │
│  │                                                │ │
│  │ [Chart showing trend]                          │ │
│  │                                                │ │
│  │ Keep it up! 🔥 [Share] [View Details]         │ │
│  └───────────────────────────────────────────────┘ │
│  Yesterday                                          │
│  ─────────                                          │
│  [More insights...]                                 │
└─────────────────────────────────────────────────────┘
```

### Implementation

```typescript
const InsightsTimeline = () => {
  const [filters, setFilters] = useState<InsightFilters>({
    pillars: [],
    types: [],
    severity: [],
  });

  const insights = useFetchInsights(filters);
  const groupedByDate = groupInsightsByDate(insights);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Filters */}
      <InsightFilters filters={filters} onChange={setFilters} />

      {/* Timeline */}
      <div className="mt-6 space-y-8">
        {Object.entries(groupedByDate).map(([date, insights]) => (
          <div key={date}>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {formatDateGroup(date)}
            </h3>
            <div className="space-y-4">
              {insights.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onMarkRead={() => markAsRead(insight.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <CelebrationModal
          achievement={currentAchievement}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
};
```

---

## Integration & API Usage

### API Hooks
```typescript
// Custom hooks for data fetching
export const useDailyBriefing = (date: Date) => {
  return useQuery(['dailyBriefing', date], () =>
    fetchDailyBriefing(date)
  );
};

export const useWeeklyReview = (week: string) => {
  return useQuery(['weeklyReview', week], () =>
    fetchWeeklyReview(week)
  );
};

export const useCorrelations = (filters?: CorrelationFilters) => {
  return useQuery(['correlations', filters], () =>
    fetchCorrelations(filters)
  );
};

export const useRecommendations = (filters?: RecommendationFilters) => {
  return useQuery(['recommendations', filters], () =>
    fetchRecommendations(filters)
  );
};

export const useInsights = (filters?: InsightFilters) => {
  return useQuery(['insights', filters], () =>
    fetchInsights(filters)
  );
};
```

### State Management
```typescript
// Global state for intelligence features
interface IntelligenceState {
  dailyBriefing: DailyBriefing | null;
  weeklyReview: WeeklyReview | null;
  insights: Insight[];
  recommendations: Recommendation[];
  correlations: Correlation[];
  unreadInsightsCount: number;
  activeRecommendationsCount: number;
}

// Context Provider
export const IntelligenceProvider = ({ children }) => {
  const [state, setState] = useState<IntelligenceState>(initialState);

  // Auto-fetch daily briefing on mount
  useEffect(() => {
    fetchDailyBriefing(new Date()).then(briefing => {
      setState(s => ({ ...s, dailyBriefing: briefing }));
    });
  }, []);

  return (
    <IntelligenceContext.Provider value={{ state, setState }}>
      {children}
    </IntelligenceContext.Provider>
  );
};
```

---

## Routing Configuration

```typescript
// Add to App.tsx
import MainDashboard from './pages/MainDashboard';
import DailyBriefingPage from './pages/DailyBriefingPage';
import WeeklyReviewPage from './pages/WeeklyReviewPage';
import IntelligencePage from './pages/IntelligencePage';

<Routes>
  <Route path="/dashboard" element={<MainDashboard />} />
  <Route path="/briefing" element={<DailyBriefingPage />} />
  <Route path="/weekly-review" element={<WeeklyReviewPage />} />
  <Route path="/weekly-review/:week" element={<WeeklyReviewPage />} />

  <Route path="/intelligence" element={<IntelligencePage />}>
    <Route path="correlations" element={<CorrelationsView />} />
    <Route path="recommendations" element={<RecommendationsCenter />} />
    <Route path="insights" element={<InsightsTimeline />} />
  </Route>
</Routes>
```

---

## Next Steps

1. **Create page components** following these specifications
2. **Implement API integration** with backend intelligence endpoints
3. **Add real-time updates** with WebSocket or polling
4. **Test with sample data** before connecting to real backend
5. **Add animations** for celebrations and transitions
6. **Optimize performance** with lazy loading and memoization
7. **Add export functionality** for PDF reports
8. **Implement sharing** features for weekly reviews

## Success Metrics

- User engagement with daily briefing (>80% view rate)
- Recommendation acceptance rate (>40%)
- Time spent on correlations view
- Weekly review completion rate
- Insight read rate
- User feedback on AI-generated content

