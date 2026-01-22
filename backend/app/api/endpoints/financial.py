from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.user import User
from app.models.financial import (
    Transaction,
    Budget,
    Investment,
    Debt,
    FinancialGoal,
    TransactionType,
    TransactionCategory,
)
from app.schemas.financial import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    BudgetCreate,
    BudgetUpdate,
    BudgetResponse,
    InvestmentCreate,
    InvestmentUpdate,
    InvestmentResponse,
    DebtCreate,
    DebtUpdate,
    DebtResponse,
    FinancialGoalCreate,
    FinancialGoalUpdate,
    FinancialGoalResponse,
)
from app.api.deps import get_current_active_user

router = APIRouter()


# ==================== TRANSACTIONS ====================

@router.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new financial transaction"""
    transaction = Transaction(
        **transaction_data.model_dump(),
        user_id=current_user.id
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    skip: int = 0,
    limit: int = 100,
    transaction_type: Optional[TransactionType] = None,
    category: Optional[TransactionCategory] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all transactions with optional filters"""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    if category:
        query = query.filter(Transaction.category == category)
    if start_date:
        query = query.filter(Transaction.transaction_date >= start_date)
    if end_date:
        query = query.filter(Transaction.transaction_date <= end_date)
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)

    transactions = (
        query.order_by(Transaction.transaction_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return transactions


@router.get("/transactions/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific transaction by ID"""
    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
        .first()
    )
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    return transaction


@router.put("/transactions/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a transaction"""
    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
        .first()
    )
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    update_data = transaction_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)
    return transaction


@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a transaction"""
    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
        .first()
    )
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    db.delete(transaction)
    db.commit()
    return None


# ==================== BUDGETS ====================

@router.post("/budgets", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new budget"""
    # Check if budget already exists for this category and period
    existing = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.category == budget_data.category,
            Budget.is_active == 1
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Active budget already exists for category {budget_data.category}"
        )

    budget = Budget(**budget_data.model_dump(), user_id=current_user.id)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.get("/budgets", response_model=List[BudgetResponse])
def get_budgets(
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all budgets"""
    query = db.query(Budget).filter(Budget.user_id == current_user.id)

    if active_only:
        query = query.filter(Budget.is_active == 1)

    budgets = query.order_by(Budget.created_at.desc()).all()
    return budgets


@router.get("/budgets/{budget_id}", response_model=BudgetResponse)
def get_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific budget"""
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.id)
        .first()
    )
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    return budget


@router.put("/budgets/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    budget_data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a budget"""
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.id)
        .first()
    )
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )

    update_data = budget_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget, field, value)

    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/budgets/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a budget"""
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.id)
        .first()
    )
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )

    db.delete(budget)
    db.commit()
    return None


# ==================== INVESTMENTS ====================

@router.post("/investments", response_model=InvestmentResponse, status_code=status.HTTP_201_CREATED)
def create_investment(
    investment_data: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new investment"""
    investment = Investment(**investment_data.model_dump(), user_id=current_user.id)
    db.add(investment)
    db.commit()
    db.refresh(investment)
    return investment


@router.get("/investments", response_model=List[InvestmentResponse])
def get_investments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all investments"""
    investments = (
        db.query(Investment)
        .filter(Investment.user_id == current_user.id)
        .order_by(Investment.created_at.desc())
        .all()
    )
    return investments


@router.get("/investments/{investment_id}", response_model=InvestmentResponse)
def get_investment(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific investment"""
    investment = (
        db.query(Investment)
        .filter(Investment.id == investment_id, Investment.user_id == current_user.id)
        .first()
    )
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    return investment


@router.put("/investments/{investment_id}", response_model=InvestmentResponse)
def update_investment(
    investment_id: int,
    investment_data: InvestmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update an investment"""
    investment = (
        db.query(Investment)
        .filter(Investment.id == investment_id, Investment.user_id == current_user.id)
        .first()
    )
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )

    update_data = investment_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(investment, field, value)

    db.commit()
    db.refresh(investment)
    return investment


@router.delete("/investments/{investment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investment(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete an investment"""
    investment = (
        db.query(Investment)
        .filter(Investment.id == investment_id, Investment.user_id == current_user.id)
        .first()
    )
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )

    db.delete(investment)
    db.commit()
    return None


# ==================== DEBTS ====================

@router.post("/debts", response_model=DebtResponse, status_code=status.HTTP_201_CREATED)
def create_debt(
    debt_data: DebtCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new debt"""
    debt = Debt(**debt_data.model_dump(), user_id=current_user.id)
    db.add(debt)
    db.commit()
    db.refresh(debt)
    return debt


@router.get("/debts", response_model=List[DebtResponse])
def get_debts(
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all debts"""
    query = db.query(Debt).filter(Debt.user_id == current_user.id)

    if active_only:
        query = query.filter(Debt.is_active == 1)

    debts = query.order_by(Debt.created_at.desc()).all()
    return debts


@router.get("/debts/{debt_id}", response_model=DebtResponse)
def get_debt(
    debt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific debt"""
    debt = (
        db.query(Debt)
        .filter(Debt.id == debt_id, Debt.user_id == current_user.id)
        .first()
    )
    if not debt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debt not found"
        )
    return debt


@router.put("/debts/{debt_id}", response_model=DebtResponse)
def update_debt(
    debt_id: int,
    debt_data: DebtUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a debt"""
    debt = (
        db.query(Debt)
        .filter(Debt.id == debt_id, Debt.user_id == current_user.id)
        .first()
    )
    if not debt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debt not found"
        )

    update_data = debt_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(debt, field, value)

    db.commit()
    db.refresh(debt)
    return debt


@router.delete("/debts/{debt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_debt(
    debt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a debt"""
    debt = (
        db.query(Debt)
        .filter(Debt.id == debt_id, Debt.user_id == current_user.id)
        .first()
    )
    if not debt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debt not found"
        )

    db.delete(debt)
    db.commit()
    return None


# ==================== FINANCIAL GOALS ====================

@router.post("/goals", response_model=FinancialGoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: FinancialGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new financial goal"""
    goal = FinancialGoal(**goal_data.model_dump(), user_id=current_user.id)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.get("/goals", response_model=List[FinancialGoalResponse])
def get_goals(
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all financial goals"""
    query = db.query(FinancialGoal).filter(FinancialGoal.user_id == current_user.id)

    if active_only:
        query = query.filter(FinancialGoal.is_completed == 0)

    goals = query.order_by(FinancialGoal.priority.desc(), FinancialGoal.created_at.desc()).all()
    return goals


@router.get("/goals/{goal_id}", response_model=FinancialGoalResponse)
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific financial goal"""
    goal = (
        db.query(FinancialGoal)
        .filter(FinancialGoal.id == goal_id, FinancialGoal.user_id == current_user.id)
        .first()
    )
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    return goal


@router.put("/goals/{goal_id}", response_model=FinancialGoalResponse)
def update_goal(
    goal_id: int,
    goal_data: FinancialGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a financial goal"""
    goal = (
        db.query(FinancialGoal)
        .filter(FinancialGoal.id == goal_id, FinancialGoal.user_id == current_user.id)
        .first()
    )
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )

    update_data = goal_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)

    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a financial goal"""
    goal = (
        db.query(FinancialGoal)
        .filter(FinancialGoal.id == goal_id, FinancialGoal.user_id == current_user.id)
        .first()
    )
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )

    db.delete(goal)
    db.commit()
    return None


# ==================== AI CATEGORIZATION ====================

@router.post("/transactions/categorize")
def categorize_transaction(
    description: str = Query(..., description="Transaction description"),
    merchant: Optional[str] = Query(None, description="Merchant name"),
    amount: Optional[float] = Query(None, description="Transaction amount"),
    current_user: User = Depends(get_current_active_user),
):
    """
    AI-powered automatic transaction categorization.
    Returns the predicted category and confidence score.
    """
    from app.services.ai_categorization import get_categorizer

    categorizer = get_categorizer()
    predicted_category = categorizer.categorize(description, merchant, amount)
    confidence = categorizer.get_confidence_score(description, merchant, predicted_category)
    suggestions = categorizer.suggest_categories(description, merchant, top_k=3)

    return {
        "predicted_category": predicted_category,
        "confidence": confidence,
        "alternative_suggestions": suggestions
    }


# ==================== DASHBOARD ====================

@router.get("/dashboard")
def get_financial_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Comprehensive financial dashboard with aggregated data.
    Returns current balance, net worth, spending by category, and trends.
    """
    from datetime import datetime, timedelta
    from sqlalchemy import func

    now = datetime.now()
    current_month_start = datetime(now.year, now.month, 1)
    last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)

    # Current month transactions
    current_month_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_date >= current_month_start
    ).all()

    # Last month transactions
    last_month_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_date >= last_month_start,
        Transaction.transaction_date < current_month_start
    ).all()

    # Calculate current month metrics
    current_income = sum(
        t.amount for t in current_month_transactions
        if t.transaction_type == TransactionType.INCOME
    )
    current_expenses = sum(
        t.amount for t in current_month_transactions
        if t.transaction_type == TransactionType.EXPENSE
    )

    # Calculate last month metrics
    last_income = sum(
        t.amount for t in last_month_transactions
        if t.transaction_type == TransactionType.INCOME
    )
    last_expenses = sum(
        t.amount for t in last_month_transactions
        if t.transaction_type == TransactionType.EXPENSE
    )

    # Spending by category
    category_spending = {}
    for transaction in current_month_transactions:
        if transaction.transaction_type == TransactionType.EXPENSE:
            category = transaction.category.value
            category_spending[category] = category_spending.get(category, 0) + transaction.amount

    # Calculate net worth (all time)
    all_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).all()

    total_income_all_time = sum(
        t.amount for t in all_transactions
        if t.transaction_type == TransactionType.INCOME
    )
    total_expenses_all_time = sum(
        t.amount for t in all_transactions
        if t.transaction_type == TransactionType.EXPENSE
    )

    # Get investments
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    investment_value = sum(
        inv.quantity * (inv.current_price or inv.purchase_price)
        for inv in investments
    )

    # Get debts
    debts = db.query(Debt).filter(
        Debt.user_id == current_user.id,
        Debt.is_active == 1
    ).all()

    total_debt = sum(debt.current_balance for debt in debts)

    net_worth = (total_income_all_time - total_expenses_all_time) + investment_value - total_debt

    # Month-over-month comparison
    income_change = ((current_income - last_income) / last_income * 100) if last_income > 0 else 0
    expense_change = ((current_expenses - last_expenses) / last_expenses * 100) if last_expenses > 0 else 0

    # Financial health score calculation
    savings_rate = ((current_income - current_expenses) / current_income * 100) if current_income > 0 else 0

    health_score = min(100, max(0, (
        (savings_rate * 0.4) +  # 40% weight on savings rate
        (min(100, (investment_value / 10000) * 10) * 0.3) +  # 30% on investments
        (max(0, 100 - (total_debt / 1000)) * 0.3)  # 30% on debt levels
    )))

    return {
        "current_balance": current_income - current_expenses,
        "net_worth": round(net_worth, 2),
        "current_month": {
            "income": round(current_income, 2),
            "expenses": round(current_expenses, 2),
            "net": round(current_income - current_expenses, 2),
            "savings_rate": round(savings_rate, 2),
        },
        "last_month": {
            "income": round(last_income, 2),
            "expenses": round(last_expenses, 2),
            "net": round(last_income - last_expenses, 2),
        },
        "month_over_month": {
            "income_change_percent": round(income_change, 2),
            "expense_change_percent": round(expense_change, 2),
        },
        "spending_by_category": {
            k: round(v, 2) for k, v in sorted(
                category_spending.items(),
                key=lambda x: x[1],
                reverse=True
            )
        },
        "investments": {
            "total_value": round(investment_value, 2),
            "count": len(investments),
        },
        "debts": {
            "total_balance": round(total_debt, 2),
            "count": len(debts),
        },
        "financial_health_score": round(health_score, 2),
    }


# ==================== FINANCIAL HEALTH SCORE ====================

@router.get("/health-score")
def calculate_financial_health_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Calculate detailed financial health score with breakdown.
    Returns overall score and individual component scores.
    """
    from datetime import datetime, timedelta

    now = datetime.now()
    three_months_ago = now - timedelta(days=90)

    # Get recent transactions
    recent_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_date >= three_months_ago
    ).all()

    income = sum(t.amount for t in recent_transactions if t.transaction_type == TransactionType.INCOME)
    expenses = sum(t.amount for t in recent_transactions if t.transaction_type == TransactionType.EXPENSE)

    # 1. Savings Rate Score (0-30 points)
    savings_rate = ((income - expenses) / income * 100) if income > 0 else 0
    savings_score = min(30, max(0, savings_rate * 1.5))

    # 2. Budget Adherence Score (0-25 points)
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.is_active == 1
    ).all()

    if budgets:
        adherence_scores = []
        for budget in budgets:
            spent = sum(
                t.amount for t in recent_transactions
                if t.transaction_type == TransactionType.EXPENSE and t.category == budget.category
            )
            adherence = max(0, 100 - (spent / budget.amount_limit * 100))
            adherence_scores.append(adherence)
        budget_score = (sum(adherence_scores) / len(adherence_scores)) * 0.25
    else:
        budget_score = 0

    # 3. Goal Progress Score (0-20 points)
    goals = db.query(FinancialGoal).filter(
        FinancialGoal.user_id == current_user.id,
        FinancialGoal.is_completed == 0
    ).all()

    if goals:
        progress_scores = []
        for goal in goals:
            progress = (goal.current_amount / goal.target_amount * 100)
            progress_scores.append(min(100, progress))
        goal_score = (sum(progress_scores) / len(progress_scores)) * 0.20
    else:
        goal_score = 0

    # 4. Debt Management Score (0-15 points)
    debts = db.query(Debt).filter(
        Debt.user_id == current_user.id,
        Debt.is_active == 1
    ).all()

    total_debt = sum(debt.current_balance for debt in debts)
    monthly_income = income / 3  # Average over 3 months

    if monthly_income > 0:
        debt_to_income_ratio = (total_debt / (monthly_income * 12)) * 100
        debt_score = max(0, 15 - (debt_to_income_ratio * 0.15))
    else:
        debt_score = 0

    # 5. Emergency Fund Score (0-10 points)
    emergency_fund_goal = next(
        (g for g in goals if 'emergency' in g.title.lower()),
        None
    )
    if emergency_fund_goal:
        emergency_score = min(10, (emergency_fund_goal.current_amount / emergency_fund_goal.target_amount) * 10)
    else:
        emergency_score = 0

    total_score = savings_score + budget_score + goal_score + debt_score + emergency_score

    # Grade calculation
    if total_score >= 90:
        grade = "A+"
    elif total_score >= 80:
        grade = "A"
    elif total_score >= 70:
        grade = "B"
    elif total_score >= 60:
        grade = "C"
    elif total_score >= 50:
        grade = "D"
    else:
        grade = "F"

    return {
        "overall_score": round(total_score, 2),
        "grade": grade,
        "breakdown": {
            "savings_rate": {
                "score": round(savings_score, 2),
                "max_score": 30,
                "actual_rate": round(savings_rate, 2),
            },
            "budget_adherence": {
                "score": round(budget_score, 2),
                "max_score": 25,
            },
            "goal_progress": {
                "score": round(goal_score, 2),
                "max_score": 20,
            },
            "debt_management": {
                "score": round(debt_score, 2),
                "max_score": 15,
            },
            "emergency_fund": {
                "score": round(emergency_score, 2),
                "max_score": 10,
            },
        },
        "recommendations": generate_recommendations(
            savings_score, budget_score, goal_score, debt_score, emergency_score
        )
    }


def generate_recommendations(savings_score, budget_score, goal_score, debt_score, emergency_score):
    """Generate personalized financial recommendations"""
    recommendations = []

    if savings_score < 15:
        recommendations.append("Increase your savings rate to at least 20% of income")
    if budget_score < 15 and budget_score > 0:
        recommendations.append("Review and adjust your budgets to match spending patterns")
    if budget_score == 0:
        recommendations.append("Set up budgets for your main expense categories")
    if goal_score < 10 and goal_score > 0:
        recommendations.append("Focus on making consistent progress towards your goals")
    if goal_score == 0:
        recommendations.append("Create financial goals to stay motivated")
    if debt_score < 10:
        recommendations.append("Prioritize paying down high-interest debt")
    if emergency_score < 5:
        recommendations.append("Build an emergency fund covering 3-6 months of expenses")

    if not recommendations:
        recommendations.append("Great job! Keep up your excellent financial habits")

    return recommendations


# ==================== SMART BUDGET SUGGESTIONS ====================

@router.get("/budgets/suggestions")
def get_budget_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Smart budget suggestions based on historical spending data.
    Analyzes past 3 months of spending to recommend budgets.
    """
    from datetime import datetime, timedelta
    from sqlalchemy import func

    now = datetime.now()
    three_months_ago = now - timedelta(days=90)

    # Get transactions from last 3 months
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == TransactionType.EXPENSE,
        Transaction.transaction_date >= three_months_ago
    ).all()

    # Group by category and calculate statistics
    category_stats = {}
    for transaction in transactions:
        category = transaction.category.value
        if category not in category_stats:
            category_stats[category] = []
        category_stats[category].append(transaction.amount)

    suggestions = []
    for category, amounts in category_stats.items():
        avg_spending = sum(amounts) / 3  # Average per month
        max_spending = max(amounts)
        min_spending = min(amounts)

        # Suggested budget: average + 10% buffer
        suggested_budget = avg_spending * 1.1

        # Calculate variability
        variability = (max_spending - min_spending) / avg_spending if avg_spending > 0 else 0

        suggestions.append({
            "category": category,
            "suggested_monthly_budget": round(suggested_budget, 2),
            "historical_average": round(avg_spending, 2),
            "historical_range": {
                "min": round(min_spending, 2),
                "max": round(max_spending, 2),
            },
            "variability": round(variability, 2),
            "confidence": "high" if variability < 0.3 else "medium" if variability < 0.6 else "low",
            "recommendation": f"Set a budget of ${suggested_budget:.2f}/month for {category}"
        })

    # Sort by average spending (highest first)
    suggestions.sort(key=lambda x: x['historical_average'], reverse=True)

    return {
        "suggestions": suggestions,
        "analysis_period": "last 3 months",
        "total_categories": len(suggestions),
    }


# ==================== DEBT PAYOFF STRATEGIES ====================

@router.get("/debts/payoff-strategy")
def calculate_debt_payoff_strategy(
    monthly_payment: float = Query(..., description="Total monthly payment available for debt"),
    strategy: str = Query("avalanche", description="Strategy: 'avalanche' or 'snowball'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Calculate debt payoff strategy and timeline.

    - Avalanche: Pay off highest interest rate first
    - Snowball: Pay off smallest balance first
    """
    from datetime import datetime
    from dateutil.relativedelta import relativedelta

    debts = db.query(Debt).filter(
        Debt.user_id == current_user.id,
        Debt.is_active == 1
    ).all()

    if not debts:
        return {
            "message": "No active debts found",
            "debts": [],
        }

    # Prepare debt data
    debt_data = []
    for debt in debts:
        debt_data.append({
            "id": debt.id,
            "name": debt.name,
            "balance": debt.current_balance,
            "interest_rate": debt.interest_rate,
            "minimum_payment": debt.minimum_payment,
        })

    # Sort based on strategy
    if strategy == "avalanche":
        debt_data.sort(key=lambda x: x['interest_rate'], reverse=True)
    else:  # snowball
        debt_data.sort(key=lambda x: x['balance'])

    # Calculate payoff timeline
    timeline = []
    remaining_debts = debt_data.copy()
    current_month = 0
    total_interest_paid = 0

    while remaining_debts and current_month < 360:  # Max 30 years
        current_month += 1
        available_payment = monthly_payment

        # Pay minimum on all debts
        for debt in remaining_debts:
            payment = min(debt['minimum_payment'], debt['balance'])
            monthly_interest = (debt['balance'] * (debt['interest_rate'] / 100)) / 12
            principal_payment = payment - monthly_interest

            debt['balance'] -= principal_payment
            total_interest_paid += monthly_interest
            available_payment -= payment

        # Apply extra payment to first debt (highest priority)
        if available_payment > 0 and remaining_debts:
            first_debt = remaining_debts[0]
            extra_payment = min(available_payment, first_debt['balance'])
            first_debt['balance'] -= extra_payment

        # Remove paid off debts
        newly_paid = [d for d in remaining_debts if d['balance'] <= 0]
        remaining_debts = [d for d in remaining_debts if d['balance'] > 0]

        # Record payoff events
        for debt in newly_paid:
            payoff_date = datetime.now() + relativedelta(months=current_month)
            timeline.append({
                "month": current_month,
                "debt_name": debt['name'],
                "payoff_date": payoff_date.strftime("%Y-%m-%d"),
            })

    total_months = current_month if not remaining_debts else None
    payoff_date = (datetime.now() + relativedelta(months=total_months)) if total_months else None

    return {
        "strategy": strategy,
        "monthly_payment": monthly_payment,
        "total_months": total_months,
        "payoff_date": payoff_date.strftime("%Y-%m-%d") if payoff_date else "Unable to calculate",
        "total_interest_paid": round(total_interest_paid, 2),
        "timeline": timeline,
        "payment_order": [d['name'] for d in debt_data],
    }


# ==================== ANALYTICS & COMPARISONS ====================

@router.get("/analytics/trends")
def get_spending_trends(
    period: str = Query("monthly", description="Period: 'daily', 'weekly', 'monthly'"),
    months_back: int = Query(6, description="Number of months to look back"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get spending and income trends over time with comparisons.
    """
    from datetime import datetime, timedelta
    from collections import defaultdict

    now = datetime.now()
    start_date = now - timedelta(days=months_back * 30)

    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_date >= start_date
    ).order_by(Transaction.transaction_date).all()

    # Group transactions by period
    grouped = defaultdict(lambda: {'income': 0, 'expenses': 0})

    for transaction in transactions:
        if period == "monthly":
            key = transaction.transaction_date.strftime("%Y-%m")
        elif period == "weekly":
            # Get week number
            key = transaction.transaction_date.strftime("%Y-W%W")
        else:  # daily
            key = transaction.transaction_date.strftime("%Y-%m-%d")

        if transaction.transaction_type == TransactionType.INCOME:
            grouped[key]['income'] += transaction.amount
        else:
            grouped[key]['expenses'] += transaction.amount

    # Convert to list and calculate net
    trends = []
    for key in sorted(grouped.keys()):
        data = grouped[key]
        trends.append({
            "period": key,
            "income": round(data['income'], 2),
            "expenses": round(data['expenses'], 2),
            "net": round(data['income'] - data['expenses'], 2),
            "savings_rate": round(((data['income'] - data['expenses']) / data['income'] * 100), 2) if data['income'] > 0 else 0
        })

    return {
        "period": period,
        "data": trends,
        "summary": {
            "total_periods": len(trends),
            "average_income": round(sum(t['income'] for t in trends) / len(trends), 2) if trends else 0,
            "average_expenses": round(sum(t['expenses'] for t in trends) / len(trends), 2) if trends else 0,
            "average_savings_rate": round(sum(t['savings_rate'] for t in trends) / len(trends), 2) if trends else 0,
        }
    }


@router.get("/analytics/category-trends")
def get_category_trends(
    months_back: int = Query(6, description="Number of months to look back"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Analyze spending trends by category over time.
    """
    from datetime import datetime, timedelta
    from collections import defaultdict

    now = datetime.now()
    start_date = now - timedelta(days=months_back * 30)

    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == TransactionType.EXPENSE,
        Transaction.transaction_date >= start_date
    ).all()

    # Group by month and category
    monthly_category = defaultdict(lambda: defaultdict(float))

    for transaction in transactions:
        month = transaction.transaction_date.strftime("%Y-%m")
        category = transaction.category.value
        monthly_category[month][category] += transaction.amount

    # Analyze trends for each category
    category_trends = {}
    for month, categories in monthly_category.items():
        for category, amount in categories.items():
            if category not in category_trends:
                category_trends[category] = []
            category_trends[category].append({
                "month": month,
                "amount": round(amount, 2)
            })

    # Calculate trend direction for each category
    results = []
    for category, data in category_trends.items():
        sorted_data = sorted(data, key=lambda x: x['month'])
        if len(sorted_data) >= 2:
            first_half_avg = sum(d['amount'] for d in sorted_data[:len(sorted_data)//2]) / (len(sorted_data)//2)
            second_half_avg = sum(d['amount'] for d in sorted_data[len(sorted_data)//2:]) / (len(sorted_data) - len(sorted_data)//2)
            trend = "increasing" if second_half_avg > first_half_avg else "decreasing"
            change_percent = ((second_half_avg - first_half_avg) / first_half_avg * 100) if first_half_avg > 0 else 0
        else:
            trend = "stable"
            change_percent = 0

        results.append({
            "category": category,
            "trend": trend,
            "change_percent": round(change_percent, 2),
            "monthly_data": sorted_data,
            "average_monthly": round(sum(d['amount'] for d in sorted_data) / len(sorted_data), 2)
        })

    # Sort by average monthly spending
    results.sort(key=lambda x: x['average_monthly'], reverse=True)

    return {
        "categories": results,
        "analysis_period": f"last {months_back} months",
    }
