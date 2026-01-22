from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from app.models.financial import TransactionType, TransactionCategory, InvestmentType, DebtType


# Transaction Schemas
class TransactionBase(BaseModel):
    transaction_type: TransactionType
    category: TransactionCategory
    amount: float = Field(..., gt=0)
    description: Optional[str] = None
    transaction_date: datetime
    merchant: Optional[str] = None
    tags: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    transaction_type: Optional[TransactionType] = None
    category: Optional[TransactionCategory] = None
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    transaction_date: Optional[datetime] = None
    merchant: Optional[str] = None
    tags: Optional[str] = None


class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Budget Schemas
class BudgetBase(BaseModel):
    category: TransactionCategory
    amount_limit: float = Field(..., gt=0)
    period: str
    start_date: datetime
    end_date: Optional[datetime] = None
    alert_threshold: float = Field(default=0.8, ge=0, le=1)


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    amount_limit: Optional[float] = Field(None, gt=0)
    period: Optional[str] = None
    end_date: Optional[datetime] = None
    is_active: Optional[int] = None
    alert_threshold: Optional[float] = Field(None, ge=0, le=1)


class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    is_active: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Investment Schemas
class InvestmentBase(BaseModel):
    investment_type: InvestmentType
    name: str
    symbol: Optional[str] = None
    quantity: float = Field(..., gt=0)
    purchase_price: float = Field(..., gt=0)
    current_price: Optional[float] = Field(None, gt=0)
    purchase_date: datetime
    notes: Optional[str] = None


class InvestmentCreate(InvestmentBase):
    pass


class InvestmentUpdate(BaseModel):
    quantity: Optional[float] = Field(None, gt=0)
    current_price: Optional[float] = Field(None, gt=0)
    notes: Optional[str] = None


class InvestmentResponse(InvestmentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Debt Schemas
class DebtBase(BaseModel):
    debt_type: DebtType
    name: str
    original_amount: float = Field(..., gt=0)
    current_balance: float = Field(..., ge=0)
    interest_rate: float = Field(..., ge=0)
    minimum_payment: float = Field(..., gt=0)
    due_date: Optional[int] = Field(None, ge=1, le=31)
    start_date: datetime
    target_payoff_date: Optional[datetime] = None
    notes: Optional[str] = None


class DebtCreate(DebtBase):
    pass


class DebtUpdate(BaseModel):
    current_balance: Optional[float] = Field(None, ge=0)
    minimum_payment: Optional[float] = Field(None, gt=0)
    target_payoff_date: Optional[datetime] = None
    is_active: Optional[int] = None
    notes: Optional[str] = None


class DebtResponse(DebtBase):
    id: int
    user_id: int
    is_active: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Financial Goal Schemas
class FinancialGoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_amount: float = Field(..., gt=0)
    current_amount: float = Field(default=0.0, ge=0)
    target_date: Optional[datetime] = None
    category: Optional[str] = None
    priority: int = Field(default=1, ge=1, le=5)


class FinancialGoalCreate(FinancialGoalBase):
    pass


class FinancialGoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_amount: Optional[float] = Field(None, gt=0)
    current_amount: Optional[float] = Field(None, ge=0)
    target_date: Optional[datetime] = None
    priority: Optional[int] = Field(None, ge=1, le=5)
    is_completed: Optional[int] = None


class FinancialGoalResponse(FinancialGoalBase):
    id: int
    user_id: int
    is_completed: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
