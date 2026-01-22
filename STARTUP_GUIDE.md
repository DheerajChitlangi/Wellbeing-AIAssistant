# Wellbeing Copilot - Startup & Testing Guide

Complete guide to launch and test the application.

---

## 🚀 Quick Start

### Prerequisites

#### Required Software:
- **Python 3.10+** (for backend)
- **Node.js 18+** (for frontend)
- **npm or yarn** (for frontend packages)

#### Check Versions:
```bash
python --version    # Should be 3.10+
node --version      # Should be 18+
npm --version
```

---

## 📦 Step 1: Backend Setup

### 1.1 Navigate to Backend Directory
```bash
cd C:\Users\abung\OneDrive\Desktop\GenAI_Learning\Claude_Code\wellbeing-copilot\backend
```

### 1.2 Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# For Mac/Linux:
# source venv/bin/activate
```

### 1.3 Install Dependencies
```bash
pip install -r requirements.txt
```

### 1.4 Create Environment File
Create a `.env` file in the `backend` directory:

```bash
# backend/.env
DATABASE_URL=sqlite:///./wellbeing.db
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 1.5 Initialize Database
```bash
# The database will be created automatically on first run
# Tables are created via SQLAlchemy Base.metadata.create_all()
```

### 1.6 Start Backend Server
```bash
uvicorn app.main:app --reload
```

**✅ Backend Running:** `http://localhost:8000`

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## 🎨 Step 2: Frontend Setup

### 2.1 Open New Terminal
Keep the backend running and open a new terminal.

### 2.2 Navigate to Frontend Directory
```bash
cd C:\Users\abung\OneDrive\Desktop\GenAI_Learning\Claude_Code\wellbeing-copilot\frontend
```

### 2.3 Install Dependencies
```bash
npm icd 
```

### 2.4 Start Frontend Dev Server
```bash
npm run dev
```

**✅ Frontend Running:** `http://localhost:5173`

**Expected Output:**
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

---

## 🧪 Step 3: Test the Application

### 3.1 Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### 3.2 Test API Documentation

**Swagger UI (Interactive API Docs):**
```
http://localhost:8000/docs
```

**ReDoc (Alternative Documentation):**
```
http://localhost:8000/redoc
```

---

## 🎯 Step 4: Testing Features

### A. Backend API Testing (via Swagger UI)

Navigate to `http://localhost:8000/docs`

#### 1. **Authentication Testing**

**Register a New User:**
1. Find **POST /api/v1/auth/register**
2. Click "Try it out"
3. Enter:
   ```json
   {
     "email": "test@example.com",
     "username": "testuser",
     "password": "testpass123",
     "full_name": "Test User"
   }
   ```
4. Click "Execute"
5. **Expected Response:** `200 OK` with user data

**Login:**
1. Find **POST /api/v1/auth/login**
2. Click "Try it out"
3. Enter:
   ```json
   {
     "username": "testuser",
     "password": "testpass123"
   }
   ```
4. Click "Execute"
5. **Copy the `access_token` from the response**

**Authorize Swagger:**
1. Click the **"Authorize"** button at the top
2. Paste the token: `Bearer YOUR_ACCESS_TOKEN`
3. Click "Authorize"
4. **Now all protected endpoints are accessible**

---

#### 2. **Financial Module Testing**

**Create a Transaction:**
```json
POST /api/v1/financial/transactions
{
  "transaction_type": "expense",
  "category": "food",
  "amount": 45.50,
  "description": "Lunch at restaurant",
  "transaction_date": "2025-01-15T12:30:00",
  "merchant": "Restaurant XYZ"
}
```

**Get Financial Dashboard:**
```
GET /api/v1/financial/dashboard
```

**AI Categorization Test:**
```
POST /api/v1/financial/transactions/categorize?description=Starbucks&merchant=Starbucks&amount=5.50
```

**Create a Budget:**
```json
POST /api/v1/financial/budgets
{
  "category": "food",
  "amount_limit": 500.00,
  "period": "monthly",
  "start_date": "2025-01-01T00:00:00",
  "alert_threshold": 0.8
}
```

**Get Budget Suggestions:**
```
GET /api/v1/financial/budgets/suggestions
```

**Calculate Financial Health Score:**
```
GET /api/v1/financial/health-score
```

---

#### 3. **Health Module Testing**

**Create a Meal:**
```json
POST /api/v1/health/meals
{
  "meal_type": "breakfast",
  "name": "Oatmeal with Berries",
  "meal_time": "2025-01-15T08:00:00",
  "rating": 4,
  "nutrition_items": [
    {
      "food_name": "Oats",
      "quantity": 50,
      "unit": "grams",
      "calories": 190,
      "protein": 7.0,
      "carbs": 32.0,
      "fat": 3.5,
      "fiber": 5.0
    }
  ]
}
```

**Log Biometrics:**
```json
POST /api/v1/health/biometrics
{
  "measurement_date": "2025-01-15T07:00:00",
  "weight": 75.5,
  "height": 175.0,
  "blood_pressure_systolic": 120,
  "blood_pressure_diastolic": 80,
  "heart_rate": 72
}
```

**Log Exercise:**
```json
POST /api/v1/health/exercise
{
  "exercise_type": "running",
  "name": "Morning Jog",
  "duration_minutes": 30,
  "intensity": 7,
  "exercise_date": "2025-01-15T06:30:00"
}
```

**Log Sleep:**
```json
POST /api/v1/health/sleep
{
  "sleep_date": "2025-01-15",
  "bedtime": "2025-01-14T23:00:00",
  "wake_time": "2025-01-15T07:00:00",
  "total_hours": 8.0,
  "sleep_quality": 8
}
```

**Get Health Dashboard:**
```
GET /api/v1/health/dashboard
```

**Calculate TDEE:**
```
GET /api/v1/health/calculations/tdee?weight_kg=75&height_cm=175&age=30&gender=male&activity_level=moderately_active&goal=maintain
```

---

### B. Frontend UI Testing

Navigate to `http://localhost:5173`

#### Current Frontend Features (Basic Wellbeing):
1. **Home Page** - Welcome screen
2. **Registration** - Create new account
3. **Login** - Authenticate
4. **Dashboard** - View wellbeing metrics

#### Financial Components Available (Not Yet Integrated):
Located in `frontend/src/components/financial/`:
- TransactionList
- AddTransactionForm
- FinancialDashboard
- BudgetManager
- FinancialHealthScore
- GoalsTracker

**See the example page:** `frontend/src/pages/Financial.tsx`

---

## 🔧 Troubleshooting

### Backend Issues

**Issue: Port 8000 already in use**
```bash
# Find and kill the process (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or change the port
uvicorn app.main:app --reload --port 8001
```

**Issue: Database errors**
```bash
# Delete the database and restart
rm wellbeing.db
# Restart the server - new DB will be created
```

**Issue: Import errors**
```bash
# Make sure you're in the backend directory
cd backend
# Make sure virtual environment is activated
venv\Scripts\activate
# Reinstall dependencies
pip install -r requirements.txt
```

---

### Frontend Issues

**Issue: Port 5173 already in use**
```bash
# Vite will automatically try the next available port
# Or specify a different port in vite.config.ts
```

**Issue: API connection errors**
```bash
# Check that backend is running on http://localhost:8000
# Check CORS settings in backend/app/main.py
# Verify API_BASE_URL in frontend/src/services/api.ts
```

**Issue: Module not found**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

---

## 📊 Testing Checklist

### ✅ Backend API Tests

- [ ] Health check: `GET http://localhost:8000/health`
- [ ] API docs accessible: `http://localhost:8000/docs`
- [ ] User registration works
- [ ] User login returns token
- [ ] Protected endpoints require authentication

**Financial Module:**
- [ ] Create transaction
- [ ] Get transactions list
- [ ] AI categorization suggests category
- [ ] Dashboard returns aggregated data
- [ ] Budget creation works
- [ ] Budget suggestions calculated
- [ ] Health score calculated
- [ ] Debt payoff strategy works

**Health Module:**
- [ ] Create meal with nutrition items
- [ ] Log biometrics (BMI auto-calculated)
- [ ] Log exercise (calories auto-calculated)
- [ ] Log sleep
- [ ] Biometric trends analysis
- [ ] Exercise summary
- [ ] Sleep analysis
- [ ] Health dashboard comprehensive
- [ ] TDEE calculator works

---

### ✅ Frontend Tests

- [ ] Home page loads
- [ ] Can register new user
- [ ] Can login
- [ ] Dashboard shows data
- [ ] Can logout

---

## 🎨 Next Steps - Integrating Financial Components

To add financial features to the frontend:

### 1. Update App Router

Edit `frontend/src/App.tsx` to add financial routes:

```tsx
import { Financial } from './pages/Financial';

// Add to routes
<Route path="/financial" element={<Financial />} />
```

### 2. Add Navigation Link

Edit `frontend/src/components/Layout.tsx`:

```tsx
<Link to="/financial">Financial</Link>
```

### 3. Test Financial Page

Navigate to `http://localhost:5173/financial`

---

## 📝 Example Test Scenarios

### Scenario 1: Complete Financial Tracking

1. **Register/Login**
2. **Add Income Transaction**
   - Category: Salary
   - Amount: $5000
3. **Add Expense Transactions**
   - Food: $400
   - Housing: $1500
   - Transportation: $200
4. **Create Budgets**
   - Food: $500/month
   - Transportation: $300/month
5. **View Dashboard**
   - See spending breakdown
   - Check budget adherence
   - View health score
6. **Get Budget Suggestions**
7. **Create Financial Goal**
   - Emergency Fund: $10,000

---

### Scenario 2: Health & Fitness Tracking

1. **Register/Login**
2. **Log Biometrics**
   - Weight, Height
   - Blood Pressure
   - Heart Rate
3. **Calculate TDEE**
   - Get personalized calorie target
4. **Log Meals**
   - Track 3 meals per day
   - Include macros
5. **Log Exercise**
   - Track workouts
6. **Log Sleep**
   - Track sleep quality
7. **View Health Dashboard**
   - See overall health score
   - Check nutrition vs targets
   - Review exercise progress

---

## 🐛 Debug Mode

### Backend Debug Logs

```python
# In app/main.py, enable debug mode
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Frontend Debug

```bash
# Check browser console (F12)
# Look for API request/response errors
# Check Network tab for failed requests
```

---

## 📖 Documentation References

- **Financial API**: `FINANCIAL_API_DOCUMENTATION.md`
- **Health API**: `HEALTH_API_DOCUMENTATION.md`
- **Frontend Components**: `FINANCIAL_COMPONENTS_README.md`
- **Database Schema**: `DATABASE_SCHEMA.md`

---

## 🎯 What's Working Now

### ✅ Backend (100% Complete)
- Authentication & User Management
- Financial Module (all endpoints)
- Health Module (all endpoints)
- AI Categorization
- Health Calculations (BMI, TDEE, etc.)
- Trend Analysis
- Dashboard Aggregations

### ✅ Frontend Components (Built, Not Integrated)
- Financial Dashboard
- Transaction Management
- Budget Manager
- Goals Tracker
- Health Score Display

### ⏳ Needs Integration
- Connect financial components to routes
- Add navigation
- Test end-to-end workflows

---

## 💡 Tips

1. **Use Swagger UI** for quick API testing
2. **Keep both servers running** in separate terminals
3. **Check browser console** for frontend errors
4. **Check terminal logs** for backend errors
5. **Copy access tokens** carefully (no extra spaces)
6. **Use Postman** as alternative to Swagger UI if needed

---

## 🎉 Success Indicators

**Backend is working when:**
- ✅ Swagger UI loads at `/docs`
- ✅ Health check returns `{"status": "healthy"}`
- ✅ Can register and login users
- ✅ Protected endpoints return data with valid token

**Frontend is working when:**
- ✅ Page loads without errors
- ✅ Can navigate between pages
- ✅ Forms submit successfully
- ✅ Data displays correctly

---

## 📞 Need Help?

1. **Check terminal output** for error messages
2. **Check browser console** (F12) for frontend errors
3. **Verify URLs** are correct (localhost:8000 and localhost:5173)
4. **Check API documentation** in `/docs`
5. **Review error responses** for details

---

## 🚀 Ready to Test!

**Start both servers and open:**
- Backend API: http://localhost:8000/docs
- Frontend App: http://localhost:5173

**First steps:**
1. Test backend API via Swagger
2. Register a user
3. Login and get token
4. Test a few endpoints
5. Open frontend and try UI features

Happy testing! 🎊
