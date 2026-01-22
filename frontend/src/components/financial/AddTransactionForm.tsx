import React, { useState, useEffect, useRef } from 'react';
import { transactionApi } from '../../services/api';
import type { Transaction } from '../../types';

interface AddTransactionFormProps {
  onSuccess?: () => void;
  existingTransaction?: Transaction;
}

const COMMON_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Other',
];

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ onSuccess, existingTransaction }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    transaction_type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCustomCategories();
  }, []);

  useEffect(() => {
    if (existingTransaction) {
      setFormData({
        amount: existingTransaction.amount.toString(),
        category: existingTransaction.category,
        description: existingTransaction.description,
        transaction_type: existingTransaction.transaction_type,
        date: existingTransaction.date,
      });
    }
  }, [existingTransaction]);

  const fetchCustomCategories = async () => {
    try {
      const response = await transactionApi.getAll(0, 1000);
      const categories = Array.from(new Set(response.data.map(t => t.category)));
      setCustomCategories(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const allCategories = Array.from(new Set([...COMMON_CATEGORIES, ...customCategories]));

  const filteredCategories = allCategories.filter(cat =>
    cat.toLowerCase().includes(formData.category.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || !formData.category || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const transactionData = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        transaction_type: formData.transaction_type,
        date: formData.date,
      };

      if (existingTransaction?.id) {
        await transactionApi.update(existingTransaction.id, transactionData);
      } else {
        await transactionApi.create(transactionData);
      }

      setFormData({
        amount: '',
        category: '',
        description: '',
        transaction_type: 'expense',
        date: new Date().toISOString().split('T')[0],
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to save transaction. Please try again.');
      console.error('Error saving transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category });
    setShowCategorySuggestions(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {existingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="transaction_type"
                  value="expense"
                  checked={formData.transaction_type === 'expense'}
                  onChange={(e) => setFormData({ ...formData, transaction_type: 'expense' })}
                  className="mr-2"
                />
                <span className="text-sm">Expense</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="transaction_type"
                  value="income"
                  checked={formData.transaction_type === 'income'}
                  onChange={(e) => setFormData({ ...formData, transaction_type: 'income' })}
                  className="mr-2"
                />
                <span className="text-sm">Income</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="pl-8 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              ref={categoryInputRef}
              type="text"
              id="category"
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
                setShowCategorySuggestions(true);
              }}
              onFocus={() => setShowCategorySuggestions(true)}
              onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Start typing or select a category"
              required
            />
            {showCategorySuggestions && filteredCategories.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCategories.map((category) => (
                  <div
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                  >
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What was this transaction for?"
            required
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-3 px-6 rounded-lg font-medium text-white transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Saving...' : existingTransaction ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransactionForm;
