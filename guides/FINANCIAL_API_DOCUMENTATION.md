# Financial Wellbeing API Documentation

Complete documentation for all Financial Wellbeing API endpoints.

## Base URL
```
http://localhost:8000/api/v1/financial
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

## 1. Transactions API

### Create Transaction
**POST** `/transactions`

Create a new financial transaction with automatic AI categorization support.

**Request Body:**
```json
{
  "transaction_type": "expense",
  "category": "food",
  "amount": 45.50,
  "description": "Lunch at Chipotle",
  "transaction_date": "2025-01-15T12:30:00",
  "merchant": "Chipotle",
  "tags": "lunch,dining"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "user_id": 1,
  "transaction_type": "expense",
  "category": "food",
  "amount": 45.50,
  "description": "Lunch at Chipotle",
  "transaction_date": "2025-01-15T12:30:00",
  "merchant": "Chipotle",
  "tags": "lunch,dining",
  "created_at": "2025-01-15T12:31:00",
  "updated_at": null
}
```

---

### Get All Transactions
**GET** `/transactions?skip=0&limit=100`

Retrieve transactions with optional filtering.

**Query Parameters:**
- `skip` (int): Number of records to skip (pagination)
- `limit` (int): Maximum number of records to return
- `transaction_type` (string): Filter by type (income/expense)
- `category` (string): Filter by category
- `start_date` (datetime): Filter transactions after this date
- `end_date` (datetime): Filter transactions before this date
- `min_amount` (float): Minimum transaction amount
- `max_amount` (float): Maximum transaction amount

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "transaction_type": "expense",
    "category": "food",
    "amount": 45.50,
    ...
  }
]
```

---

### Get Single Transaction
**GET** `/transactions/{transaction_id}`

**Response:** `200 OK` - Returns single transaction object

---

### Update Transaction
**PUT** `/transactions/{transaction_id}`

**Request Body:** Partial update (all fields optional)
```json
{
  "amount": 50.00,
  "description": "Updated description"
}
```

**Response:** `200 OK` - Returns updated transaction

---

### Delete Transaction
**DELETE** `/transactions/{transaction_id}`

**Response:** `204 No Content`

---

## 2. AI Categorization API

### Categorize Transaction
**POST** `/transactions/categorize`

AI-powered automatic transaction categorization.

**Query Parameters:**
- `description` (string, required): Transaction description
- `merchant` (string, optional): Merchant name
- `amount` (float, optional): Transaction amount

**Example Request:**
```
POST /transactions/categorize?description=Starbucks%20coffee&merchant=Starbucks&amount=5.50
```

**Response:** `200 OK`
```json
{
  "predicted_category": "food",
  "confidence": 0.95,
  "alternative_suggestions": [
    {
      "category": "food",
      "confidence": 0.85
    },
    {
      "category": "entertainment",
      "confidence": 0.10
    },
    {
      "category": "shopping",
      "confidence": 0.05
    }
  ]
}
```

**Features:**
- Pattern matching against 50+ merchant patterns
- Keyword-based categorization
- Confidence scoring
- Alternative suggestions
- Support for learning from corrections

---

## 3. Budget Management API

### Create Budget
**POST** `/budgets`

**Request Body:**
```json
{
  "category": "food",
  "amount_limit": 500.00,
  "period": "monthly",
  "start_date": "2025-01-01T00:00:00",
  "end_date": null,
  "alert_threshold": 0.8
}
```

**Response:** `201 Created`

---

### Get All Budgets
**GET** `/budgets?active_only=true`

**Query Parameters:**
- `active_only` (bool): Filter for active budgets only

**Response:** `200 OK` - Returns array of budgets

---

### Get Single Budget
**GET** `/budgets/{budget_id}`

---

### Update Budget
**PUT** `/budgets/{budget_id}`

---

### Delete Budget
**DELETE** `/budgets/{budget_id}`

---

### Get Budget Suggestions
**GET** `/budgets/suggestions`

Smart budget suggestions based on 3 months of historical spending data.

**Response:** `200 OK`
```json
{
  "suggestions": [
    {
      "category": "food",
      "suggested_monthly_budget": 550.00,
      "historical_average": 500.00,
      "historical_range": {
        "min": 450.00,
        "max": 600.00
      },
      "variability": 0.30,
      "confidence": "high",
      "recommendation": "Set a budget of $550.00/month for food"
    }
  ],
  "analysis_period": "last 3 months",
  "total_categories": 8
}
```

**Algorithm:**
- Analyzes last 3 months of spending
- Calculates average, min, max per category
- Suggests budget = average + 10% buffer
- Provides confidence based on variability

---

## 4. Investment Tracker API

### Create Investment
**POST** `/investments`

**Request Body:**
```json
{
  "investment_type": "stocks",
  "name": "Apple Inc",
  "symbol": "AAPL",
  "quantity": 10,
  "purchase_price": 150.00,
  "current_price": 180.00,
  "purchase_date": "2024-01-01T00:00:00",
  "notes": "Long term hold"
}
```

---

### Get All Investments
**GET** `/investments`

---

### Update Investment
**PUT** `/investments/{investment_id}`

---

### Delete Investment
**DELETE** `/investments/{investment_id}`

---

## 5. Debt Manager API

### Create Debt
**POST** `/debts`

**Request Body:**
```json
{
  "debt_type": "credit_card",
  "name": "Chase Sapphire",
  "original_amount": 5000.00,
  "current_balance": 3000.00,
  "interest_rate": 18.5,
  "minimum_payment": 75.00,
  "due_date": 15,
  "start_date": "2024-01-01T00:00:00",
  "target_payoff_date": "2025-12-31T00:00:00",
  "notes": "Transfer balance if possible"
}
```

---

### Get All Debts
**GET** `/debts?active_only=true`

---

### Update Debt
**PUT** `/debts/{debt_id}`

---

### Delete Debt
**DELETE** `/debts/{debt_id}`

---

### Calculate Debt Payoff Strategy
**GET** `/debts/payoff-strategy?monthly_payment=500&strategy=avalanche`

Calculate optimal debt payoff timeline using Avalanche or Snowball method.

**Query Parameters:**
- `monthly_payment` (float, required): Total monthly payment available
- `strategy` (string): "avalanche" (highest interest first) or "snowball" (smallest balance first)

**Response:** `200 OK`
```json
{
  "strategy": "avalanche",
  "monthly_payment": 500.00,
  "total_months": 24,
  "payoff_date": "2027-01-15",
  "total_interest_paid": 850.00,
  "timeline": [
    {
      "month": 12,
      "debt_name": "Chase Sapphire",
      "payoff_date": "2026-01-15"
    },
    {
      "month": 24,
      "debt_name": "Student Loan",
      "payoff_date": "2027-01-15"
    }
  ],
  "payment_order": ["Chase Sapphire", "Student Loan", "Car Loan"]
}
```

**Strategies:**
- **Avalanche**: Pays highest interest rate first (saves most money)
- **Snowball**: Pays smallest balance first (psychological wins)

---

## 6. Financial Goals API

### Create Goal
**POST** `/goals`

**Request Body:**
```json
{
  "title": "Emergency Fund",
  "description": "6 months of expenses",
  "target_amount": 15000.00,
  "current_amount": 5000.00,
  "target_date": "2025-12-31T00:00:00",
  "category": "emergency_fund",
  "priority": 1
}
```

---

### Get All Goals
**GET** `/goals?active_only=false`

---

### Update Goal
**PUT** `/goals/{goal_id}`

---

### Delete Goal
**DELETE** `/goals/{goal_id}`

---

## 7. Financial Dashboard API

### Get Dashboard
**GET** `/dashboard`

Comprehensive financial dashboard with all key metrics.

**Response:** `200 OK`
```json
{
  "current_balance": 1250.00,
  "net_worth": 45000.00,
  "current_month": {
    "income": 5000.00,
    "expenses": 3750.00,
    "net": 1250.00,
    "savings_rate": 25.00
  },
  "last_month": {
    "income": 5000.00,
    "expenses": 4000.00,
    "net": 1000.00
  },
  "month_over_month": {
    "income_change_percent": 0.00,
    "expense_change_percent": -6.25
  },
  "spending_by_category": {
    "housing": 1500.00,
    "food": 600.00,
    "transportation": 400.00,
    "utilities": 250.00
  },
  "investments": {
    "total_value": 25000.00,
    "count": 5
  },
  "debts": {
    "total_balance": 8000.00,
    "count": 2
  },
  "financial_health_score": 75.50
}
```

**Includes:**
- Current balance and net worth
- Monthly income/expense breakdown
- Month-over-month comparisons
- Category-wise spending
- Investment portfolio value
- Total debt
- Financial health score

---

## 8. Financial Health Score API

### Calculate Health Score
**GET** `/health-score`

Detailed financial health score with component breakdown.

**Response:** `200 OK`
```json
{
  "overall_score": 78.50,
  "grade": "B",
  "breakdown": {
    "savings_rate": {
      "score": 25.00,
      "max_score": 30,
      "actual_rate": 22.50
    },
    "budget_adherence": {
      "score": 20.00,
      "max_score": 25
    },
    "goal_progress": {
      "score": 15.00,
      "max_score": 20
    },
    "debt_management": {
      "score": 12.50,
      "max_score": 15
    },
    "emergency_fund": {
      "score": 6.00,
      "max_score": 10
    }
  },
  "recommendations": [
    "Build an emergency fund covering 3-6 months of expenses",
    "Continue maintaining your excellent savings rate"
  ]
}
```

**Scoring Components:**
1. **Savings Rate** (30 points): Based on income minus expenses
2. **Budget Adherence** (25 points): How well you stick to budgets
3. **Goal Progress** (20 points): Average completion of financial goals
4. **Debt Management** (15 points): Debt-to-income ratio
5. **Emergency Fund** (10 points): Emergency fund progress

**Grades:**
- A+ (90-100): Excellent
- A (80-89): Very Good
- B (70-79): Good
- C (60-69): Fair
- D (50-59): Needs Improvement
- F (<50): Poor

---

## 9. Analytics API

### Get Spending Trends
**GET** `/analytics/trends?period=monthly&months_back=6`

Analyze income and spending trends over time.

**Query Parameters:**
- `period` (string): "daily", "weekly", or "monthly"
- `months_back` (int): Number of months to analyze

**Response:** `200 OK`
```json
{
  "period": "monthly",
  "data": [
    {
      "period": "2024-08",
      "income": 5000.00,
      "expenses": 3800.00,
      "net": 1200.00,
      "savings_rate": 24.00
    },
    {
      "period": "2024-09",
      "income": 5000.00,
      "expenses": 3600.00,
      "net": 1400.00,
      "savings_rate": 28.00
    }
  ],
  "summary": {
    "total_periods": 6,
    "average_income": 5000.00,
    "average_expenses": 3750.00,
    "average_savings_rate": 25.00
  }
}
```

---

### Get Category Trends
**GET** `/analytics/category-trends?months_back=6`

Analyze spending trends by category.

**Response:** `200 OK`
```json
{
  "categories": [
    {
      "category": "housing",
      "trend": "stable",
      "change_percent": 0.50,
      "monthly_data": [
        {
          "month": "2024-08",
          "amount": 1500.00
        },
        {
          "month": "2024-09",
          "amount": 1500.00
        }
      ],
      "average_monthly": 1500.00
    },
    {
      "category": "food",
      "trend": "decreasing",
      "change_percent": -12.50,
      "monthly_data": [...],
      "average_monthly": 600.00
    }
  ],
  "analysis_period": "last 6 months"
}
```

---

## Error Responses

All endpoints return standard HTTP status codes:

**400 Bad Request**
```json
{
  "detail": "Validation error message"
}
```

**401 Unauthorized**
```json
{
  "detail": "Not authenticated"
}
```

**404 Not Found**
```json
{
  "detail": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production.

---

## Data Types

### Transaction Types
- `income`: Money coming in
- `expense`: Money going out
- `transfer`: Transfer between accounts

### Transaction Categories

**Income:**
- `salary`
- `freelance`
- `investment_income`
- `other_income`

**Expenses:**
- `housing`
- `transportation`
- `food`
- `utilities`
- `healthcare`
- `entertainment`
- `shopping`
- `education`
- `debt_payment`
- `savings`
- `other_expense`

### Investment Types
- `stocks`
- `bonds`
- `mutual_funds`
- `etf`
- `crypto`
- `real_estate`
- `retirement`
- `other`

### Debt Types
- `credit_card`
- `student_loan`
- `mortgage`
- `car_loan`
- `personal_loan`
- `other`

---

## Best Practices

1. **Use AI Categorization**: Call `/transactions/categorize` before creating transactions
2. **Set Budgets Early**: Use `/budgets/suggestions` to get data-driven budget recommendations
3. **Track Progress**: Check `/health-score` regularly to monitor financial health
4. **Plan Debt Payoff**: Use `/debts/payoff-strategy` to create a debt elimination plan
5. **Monitor Trends**: Use `/analytics/trends` to identify spending patterns
6. **Update Goals**: Keep financial goals updated with current amounts

---

## Example Workflow

### 1. Creating a Transaction with AI Categorization

```bash
# Step 1: Get category suggestion
curl -X POST "http://localhost:8000/api/v1/financial/transactions/categorize?description=Starbucks&merchant=Starbucks&amount=5.50" \
  -H "Authorization: Bearer <token>"

# Step 2: Create transaction with suggested category
curl -X POST "http://localhost:8000/api/v1/financial/transactions" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_type": "expense",
    "category": "food",
    "amount": 5.50,
    "description": "Morning coffee",
    "transaction_date": "2025-01-15T08:30:00",
    "merchant": "Starbucks"
  }'
```

### 2. Setting Up Budget from Historical Data

```bash
# Step 1: Get budget suggestions
curl -X GET "http://localhost:8000/api/v1/financial/budgets/suggestions" \
  -H "Authorization: Bearer <token>"

# Step 2: Create budget based on suggestion
curl -X POST "http://localhost:8000/api/v1/financial/budgets" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "food",
    "amount_limit": 550.00,
    "period": "monthly",
    "start_date": "2025-01-01T00:00:00",
    "alert_threshold": 0.8
  }'
```

### 3. Planning Debt Payoff

```bash
curl -X GET "http://localhost:8000/api/v1/financial/debts/payoff-strategy?monthly_payment=1000&strategy=avalanche" \
  -H "Authorization: Bearer <token>"
```

---

## Testing with Swagger UI

Access interactive API documentation at:
```
http://localhost:8000/docs
```

This provides:
- Interactive API testing
- Request/response examples
- Schema validation
- Authentication testing

---

## Support

For issues or questions:
- Check the `/docs` endpoint for interactive documentation
- Review error messages for validation details
- Ensure authentication token is valid and not expired
