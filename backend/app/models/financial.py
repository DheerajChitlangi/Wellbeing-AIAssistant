from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Enum, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"


class TransactionCategory(str, enum.Enum):
    # Income
    SALARY = "salary"
    FREELANCE = "freelance"
    INVESTMENT_INCOME = "investment_income"
    OTHER_INCOME = "other_income"

    # Expenses
    HOUSING = "housing"
    TRANSPORTATION = "transportation"
    FOOD = "food"
    UTILITIES = "utilities"
    HEALTHCARE = "healthcare"
    ENTERTAINMENT = "entertainment"
    SHOPPING = "shopping"
    EDUCATION = "education"
    DEBT_PAYMENT = "debt_payment"
    SAVINGS = "savings"
    OTHER_EXPENSE = "other_expense"


class InvestmentType(str, enum.Enum):
    STOCKS = "stocks"
    BONDS = "bonds"
    MUTUAL_FUNDS = "mutual_funds"
    ETF = "etf"
    CRYPTO = "crypto"
    REAL_ESTATE = "real_estate"
    RETIREMENT = "retirement"
    OTHER = "other"


class DebtType(str, enum.Enum):
    CREDIT_CARD = "credit_card"
    STUDENT_LOAN = "student_loan"
    MORTGAGE = "mortgage"
    CAR_LOAN = "car_loan"
    PERSONAL_LOAN = "personal_loan"
    OTHER = "other"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    category = Column(Enum(TransactionCategory), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    transaction_date = Column(DateTime(timezone=True), nullable=False, index=True)
    merchant = Column(String, nullable=True)
    tags = Column(String, nullable=True)  # JSON string of tags
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="transactions")

    __table_args__ = (
        Index('ix_transactions_user_date', 'user_id', 'transaction_date'),
        Index('ix_transactions_user_category', 'user_id', 'category'),
    )


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category = Column(Enum(TransactionCategory), nullable=False)
    amount_limit = Column(Float, nullable=False)
    period = Column(String, nullable=False)  # monthly, weekly, yearly
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Integer, default=1)
    alert_threshold = Column(Float, default=0.8)  # Alert at 80% by default
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="budgets")

    __table_args__ = (
        Index('ix_budgets_user_active', 'user_id', 'is_active'),
    )


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    investment_type = Column(Enum(InvestmentType), nullable=False)
    name = Column(String, nullable=False)
    symbol = Column(String, nullable=True)  # Stock ticker, crypto symbol, etc.
    quantity = Column(Float, nullable=False)
    purchase_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=True)
    purchase_date = Column(DateTime(timezone=True), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="investments")

    __table_args__ = (
        Index('ix_investments_user_type', 'user_id', 'investment_type'),
    )


class Debt(Base):
    __tablename__ = "debts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    debt_type = Column(Enum(DebtType), nullable=False)
    name = Column(String, nullable=False)
    original_amount = Column(Float, nullable=False)
    current_balance = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    minimum_payment = Column(Float, nullable=False)
    due_date = Column(Integer, nullable=True)  # Day of month
    start_date = Column(DateTime(timezone=True), nullable=False)
    target_payoff_date = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Integer, default=1)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="debts")

    __table_args__ = (
        Index('ix_debts_user_active', 'user_id', 'is_active'),
    )


class FinancialGoal(Base):
    __tablename__ = "financial_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(DateTime(timezone=True), nullable=True)
    category = Column(String, nullable=True)  # emergency_fund, retirement, vacation, etc.
    priority = Column(Integer, default=1)  # 1-5 scale
    is_completed = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="financial_goals")

    __table_args__ = (
        Index('ix_financial_goals_user_active', 'user_id', 'is_completed'),
    )
