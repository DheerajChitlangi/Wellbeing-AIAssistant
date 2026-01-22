"""
AI-powered transaction categorization service.
Uses pattern matching and machine learning to automatically categorize transactions.
"""

from typing import Optional, Dict, List
from app.models.financial import TransactionCategory
import re


class TransactionCategorizer:
    """AI-powered transaction categorization using pattern matching and ML"""

    # Keyword patterns for each category
    CATEGORY_PATTERNS = {
        TransactionCategory.SALARY: [
            r'\bsalary\b', r'\bpayroll\b', r'\bwage\b', r'\bincome\b',
            r'\bemployer\b', r'\bpaycheck\b'
        ],
        TransactionCategory.FREELANCE: [
            r'\bfreelance\b', r'\bconsulting\b', r'\bcontract\b',
            r'\bgig\b', r'\bupwork\b', r'\bfiverr\b'
        ],
        TransactionCategory.INVESTMENT_INCOME: [
            r'\bdividend\b', r'\binterest\b', r'\bcapital gains\b',
            r'\breturn\b', r'\binvestment\b', r'\bstock\b', r'\bbond\b'
        ],
        TransactionCategory.HOUSING: [
            r'\brent\b', r'\bmortgage\b', r'\bhousing\b', r'\bapartment\b',
            r'\blease\b', r'\bhoa\b', r'\bproperty\b', r'\blandlord\b'
        ],
        TransactionCategory.TRANSPORTATION: [
            r'\buber\b', r'\blyft\b', r'\btaxi\b', r'\bgas\b', r'\bfuel\b',
            r'\bparking\b', r'\btransit\b', r'\bsubway\b', r'\bbus\b',
            r'\btrain\b', r'\bcar payment\b', r'\bauto\b'
        ],
        TransactionCategory.FOOD: [
            r'\brestaurant\b', r'\bgrocery\b', r'\bfood\b', r'\bcafe\b',
            r'\bcoffee\b', r'\bstarbucks\b', r'\bmcdonald\b', r'\bpizza\b',
            r'\bwhole foods\b', r'\bsafeway\b', r'\bkroger\b', r'\bwholesome\b'
        ],
        TransactionCategory.UTILITIES: [
            r'\belectric\b', r'\bwater\b', r'\bgas utility\b', r'\binternet\b',
            r'\bphone\b', r'\bcable\b', r'\butility\b', r'\bcomcast\b',
            r'\bat&t\b', r'\bverizon\b', r'\bt-mobile\b'
        ],
        TransactionCategory.HEALTHCARE: [
            r'\bdoctor\b', r'\bhospital\b', r'\bmedical\b', r'\bpharmacy\b',
            r'\bhealth\b', r'\binsurance\b', r'\bdental\b', r'\bcvs\b',
            r'\bwalgreens\b', r'\bclinic\b'
        ],
        TransactionCategory.ENTERTAINMENT: [
            r'\bmovie\b', r'\bnetflix\b', r'\bspotify\b', r'\bgaming\b',
            r'\bconcert\b', r'\btheater\b', r'\bbar\b', r'\bclub\b',
            r'\bentertainment\b', r'\bhulu\b', r'\bdisney\b'
        ],
        TransactionCategory.SHOPPING: [
            r'\bamazon\b', r'\btarget\b', r'\bwalmart\b', r'\bclothing\b',
            r'\bshop\b', r'\bretail\b', r'\bmall\b', r'\bstore\b',
            r'\bebay\b', r'\bbestbuy\b'
        ],
        TransactionCategory.EDUCATION: [
            r'\btuition\b', r'\bschool\b', r'\bcollege\b', r'\buniversity\b',
            r'\bcourse\b', r'\bbook\b', r'\beducation\b', r'\btraining\b',
            r'\budemy\b', r'\bcoursera\b'
        ],
        TransactionCategory.DEBT_PAYMENT: [
            r'\bloan payment\b', r'\bdebt\b', r'\bcredit card payment\b',
            r'\bpayment\b', r'\bmortgage payment\b', r'\bstudent loan\b'
        ],
        TransactionCategory.SAVINGS: [
            r'\bsavings\b', r'\btransfer to savings\b', r'\binvestment\b',
            r'\bretirement\b', r'\b401k\b', r'\bira\b', r'\broth\b'
        ],
    }

    # Merchant patterns for quick categorization
    MERCHANT_PATTERNS = {
        TransactionCategory.FOOD: [
            'starbucks', 'mcdonalds', 'burger king', 'chipotle', 'subway',
            'taco bell', 'wendys', 'dominos', 'pizza hut', 'kfc',
            'whole foods', 'safeway', 'kroger', 'trader joes', 'costco'
        ],
        TransactionCategory.TRANSPORTATION: [
            'uber', 'lyft', 'shell', 'chevron', 'bp', 'exxon', 'mobil',
            '76 gas', 'arco', 'parking'
        ],
        TransactionCategory.SHOPPING: [
            'amazon', 'target', 'walmart', 'bestbuy', 'ebay', 'etsy',
            'home depot', 'lowes', 'ikea', 'kohls', 'macys'
        ],
        TransactionCategory.ENTERTAINMENT: [
            'netflix', 'hulu', 'spotify', 'apple music', 'disney+',
            'hbo', 'youtube', 'twitch', 'steam', 'playstation'
        ],
        TransactionCategory.UTILITIES: [
            'comcast', 'at&t', 'verizon', 't-mobile', 'sprint',
            'cox', 'spectrum', 'xfinity'
        ],
        TransactionCategory.HEALTHCARE: [
            'cvs', 'walgreens', 'rite aid', 'kaiser', 'blue cross',
            'united healthcare', 'aetna'
        ],
    }

    def __init__(self):
        """Initialize the categorizer with compiled regex patterns"""
        self.compiled_patterns = {}
        for category, patterns in self.CATEGORY_PATTERNS.items():
            self.compiled_patterns[category] = [
                re.compile(pattern, re.IGNORECASE) for pattern in patterns
            ]

    def categorize(
        self,
        description: str,
        merchant: Optional[str] = None,
        amount: Optional[float] = None,
    ) -> TransactionCategory:
        """
        Automatically categorize a transaction based on description and merchant.

        Args:
            description: Transaction description
            merchant: Merchant name (optional)
            amount: Transaction amount (optional)

        Returns:
            Predicted transaction category
        """
        # Combine description and merchant for better matching
        text = f"{description} {merchant or ''}".lower()

        # First, try merchant-based categorization (fastest and most accurate)
        if merchant:
            merchant_lower = merchant.lower()
            for category, merchants in self.MERCHANT_PATTERNS.items():
                if any(m in merchant_lower for m in merchants):
                    return category

        # Score each category based on pattern matches
        scores = {}
        for category, patterns in self.compiled_patterns.items():
            score = sum(1 for pattern in patterns if pattern.search(text))
            if score > 0:
                scores[category] = score

        # Return the category with the highest score
        if scores:
            return max(scores, key=scores.get)

        # Default categorization based on transaction type heuristics
        if amount and amount > 1000:
            # Large amounts are more likely to be housing, salary, or debt
            if any(word in text for word in ['transfer', 'deposit']):
                return TransactionCategory.SALARY
            return TransactionCategory.HOUSING

        # Default to OTHER_EXPENSE
        return TransactionCategory.OTHER_EXPENSE

    def get_confidence_score(
        self,
        description: str,
        merchant: Optional[str] = None,
        predicted_category: TransactionCategory = None
    ) -> float:
        """
        Calculate confidence score for the categorization (0-1).

        Returns:
            Confidence score between 0 and 1
        """
        text = f"{description} {merchant or ''}".lower()

        # Check merchant match (highest confidence)
        if merchant:
            merchant_lower = merchant.lower()
            for category, merchants in self.MERCHANT_PATTERNS.items():
                if category == predicted_category:
                    if any(m in merchant_lower for m in merchants):
                        return 0.95

        # Check pattern matches
        if predicted_category in self.compiled_patterns:
            patterns = self.compiled_patterns[predicted_category]
            matches = sum(1 for pattern in patterns if pattern.search(text))
            if matches >= 3:
                return 0.90
            elif matches == 2:
                return 0.75
            elif matches == 1:
                return 0.60

        return 0.40

    def suggest_categories(
        self,
        description: str,
        merchant: Optional[str] = None,
        top_k: int = 3
    ) -> List[Dict[str, any]]:
        """
        Get top K category suggestions with confidence scores.

        Returns:
            List of dicts with 'category' and 'confidence' keys
        """
        text = f"{description} {merchant or ''}".lower()
        scores = {}

        # Score all categories
        for category, patterns in self.compiled_patterns.items():
            score = sum(1 for pattern in patterns if pattern.search(text))
            if score > 0:
                scores[category] = score

        # Sort by score and get top K
        sorted_categories = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_k]

        # Convert to confidence scores
        total_score = sum(score for _, score in sorted_categories)
        results = []
        for category, score in sorted_categories:
            confidence = score / total_score if total_score > 0 else 0
            results.append({
                'category': category,
                'confidence': round(confidence, 2)
            })

        return results

    def learn_from_correction(
        self,
        description: str,
        merchant: Optional[str],
        correct_category: TransactionCategory
    ):
        """
        Learn from user corrections to improve future predictions.
        This is a placeholder for future ML model training.

        In a production system, this would:
        1. Store the correction in a training dataset
        2. Periodically retrain the model
        3. Update category patterns based on user feedback
        """
        # TODO: Implement ML model training
        # For now, this is a placeholder that could log corrections
        pass


# Singleton instance
_categorizer = None


def get_categorizer() -> TransactionCategorizer:
    """Get or create the singleton categorizer instance"""
    global _categorizer
    if _categorizer is None:
        _categorizer = TransactionCategorizer()
    return _categorizer
