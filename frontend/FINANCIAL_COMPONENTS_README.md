# Financial Wellbeing Components

A comprehensive set of React components for financial tracking and management, built with TypeScript, Recharts, and Tailwind CSS.

## Components Overview

### 1. TransactionList
A feature-rich transaction table with advanced filtering, sorting, and search capabilities.

**Features:**
- Real-time search across description and category
- Filter by transaction type (income/expense)
- Filter by category
- Sort by date, amount, category, or description
- Inline edit and delete actions
- Responsive design with color-coded amounts
- Transaction count display

**Usage:**
```tsx
import { TransactionList } from './components/financial';

<TransactionList
  onEdit={(transaction) => handleEdit(transaction)}
  onDelete={(id) => handleDelete(id)}
  refreshTrigger={refreshCount}
/>
```

### 2. AddTransactionForm
An intuitive form for adding/editing transactions with category autocomplete.

**Features:**
- Category autocomplete with suggestions
- Common categories + custom categories from history
- Real-time validation
- Income/Expense toggle
- Date picker with default today's date
- Edit mode support

**Usage:**
```tsx
import { AddTransactionForm } from './components/financial';

<AddTransactionForm
  onSuccess={() => console.log('Transaction added')}
  existingTransaction={transactionToEdit}
/>
```

### 3. FinancialDashboard
A comprehensive dashboard with multiple Recharts visualizations.

**Features:**
- **Time Range Filter**: Week, Month, Year views
- **Summary Cards**: Total Income, Expenses, Net Income, Savings Rate
- **Spending Trends Chart**: Line chart showing income, expenses, and net over time
- **Category Breakdown**: Pie chart of expense categories
- **Net Worth Progression**: Line chart tracking cumulative net worth
- **Budget vs Actual**: Bar chart comparing budgets to actual spending

**Usage:**
```tsx
import { FinancialDashboard } from './components/financial';

<FinancialDashboard />
```

### 4. BudgetManager
Create and track budgets by category with visual progress indicators.

**Features:**
- Create budgets for any category
- Weekly, Monthly, or Yearly periods
- Real-time spending calculation
- Visual progress bars with color coding:
  - Green: < 75% used
  - Yellow: 75-90% used
  - Orange: 90-100% used
  - Red: Over budget
- Percentage tracking
- Remaining amount display
- Edit and delete capabilities

**Usage:**
```tsx
import { BudgetManager } from './components/financial';

<BudgetManager />
```

### 5. FinancialHealthScore
A comprehensive financial health scoring system with visual breakdown.

**Features:**
- **Overall Score**: Radial chart showing total health score (0-100)
- **Letter Grade**: A+ to F grading system
- **5 Key Metrics**:
  1. Savings Rate (30 points): Measures monthly savings percentage
  2. Budget Adherence (25 points): How well you stick to budgets
  3. Goal Progress (20 points): Average completion of financial goals
  4. Spending Balance (15 points): Diversity across categories
  5. Tracking Consistency (10 points): Daily tracking habits
- **Personalized Recommendations**: Actionable advice based on scores
- **Color-coded Progress Bars**: Visual feedback for each metric

**Usage:**
```tsx
import { FinancialHealthScore } from './components/financial';

<FinancialHealthScore />
```

### 6. GoalsTracker
Track financial goals with progress visualization and timeline predictions.

**Features:**
- **Smart Predictions**: Estimates completion date based on savings rate
- **On-Track Indicators**: Visual alerts if behind schedule
- **Progress Bars**: Color-coded progress tracking
- **Projection Timeline**: Line chart showing projected vs target
- **Average Savings Display**: Shows monthly savings rate
- **Update Progress**: Quick progress updates
- **Days Remaining**: Countdown to target date
- **Category Tags**: Organize goals by type

**Usage:**
```tsx
import { GoalsTracker } from './components/financial';

<GoalsTracker />
```

## Data Types

### Transaction
```typescript
interface Transaction {
  id?: number;
  amount: number;
  category: string;
  description: string;
  transaction_type: 'income' | 'expense';
  date: string;
  created_at?: string;
}
```

### Budget
```typescript
interface Budget {
  id?: number;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  spent?: number;
  created_at?: string;
}
```

### FinancialGoal
```typescript
interface FinancialGoal {
  id?: number;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}
```

## API Integration

All components use the following API endpoints:

```typescript
// Transactions
transactionApi.getAll(skip?, limit?, category?, type?)
transactionApi.create(data)
transactionApi.update(id, data)
transactionApi.delete(id)
transactionApi.getCategorySummary()

// Budgets
budgetApi.getAll()
budgetApi.create(data)
budgetApi.update(id, data)
budgetApi.delete(id)

// Financial Goals
financialGoalApi.getAll()
financialGoalApi.create(data)
financialGoalApi.update(id, data)
financialGoalApi.delete(id)
```

## Example Page Implementation

See `src/pages/Financial.tsx` for a complete example showing:
- Tab navigation between components
- State management for refresh triggers
- Responsive layout with Tailwind CSS
- Component integration

## Styling

All components use:
- **Tailwind CSS**: For responsive, utility-first styling
- **Color Scheme**:
  - Blue: Primary actions and highlights
  - Green: Income and positive metrics
  - Red: Expenses and warnings
  - Yellow/Orange: Warnings and medium priority
  - Purple: Special features (net worth, goals)

## Responsive Design

All components are fully responsive with:
- Mobile-first approach
- Grid layouts that adapt to screen size
- Horizontal scrolling for tables on mobile
- Touch-friendly buttons and inputs
- Responsive chart sizing with `ResponsiveContainer`

## Best Practices

1. **State Management**: Use the `refreshTrigger` pattern to sync components after data changes
2. **Error Handling**: All API calls include try-catch blocks with console logging
3. **User Feedback**: Loading states and empty states for better UX
4. **Accessibility**: Semantic HTML, labels for form inputs, and keyboard navigation
5. **Performance**: Memoization with `useMemo` for expensive calculations

## Future Enhancements

Potential improvements:
- Export transactions to CSV/PDF
- Recurring transactions
- Multi-currency support
- Bank account integration
- Receipt upload and OCR
- Split transactions
- Tags for transactions
- Custom date ranges
- Comparison charts (month-over-month)
- Mobile app version

## Dependencies

Required packages (already in package.json):
```json
{
  "recharts": "^2.10.3",
  "react": "^18.2.0",
  "axios": "^1.6.2",
  "tailwindcss": "^3.3.6"
}
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Import components in your pages:
   ```tsx
   import { FinancialDashboard } from './components/financial';
   ```

4. Ensure your backend API is running and matches the expected endpoints.

## Support

For issues or questions, refer to the individual component files for detailed implementation notes.
