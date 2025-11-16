import React, { useState } from 'react';
import { Plus, X, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import type { ExpenseItem } from '../../../types/rentTransaction';

interface ExpenseManagementStepProps {
  expenses: ExpenseItem[];
  onUpdate: (expenses: ExpenseItem[]) => void;
}

export const ExpenseManagementStep: React.FC<ExpenseManagementStepProps> = ({
  expenses,
  onUpdate,
}) => {
  const [newExpense, setNewExpense] = useState<Partial<ExpenseItem>>({
    category: '',
    description: '',
    amount: 0,
  });

  const handleAddExpense = () => {
    if (newExpense.category && newExpense.description && newExpense.amount && newExpense.amount > 0) {
      const expense: ExpenseItem = {
        id: Date.now().toString(),
        category: newExpense.category,
        description: newExpense.description,
        amount: newExpense.amount,
        isRemoved: false,
      };

      onUpdate([...expenses, expense]);
      setNewExpense({ category: '', description: '', amount: 0 });
    }
  };

  const handleRemoveExpense = (id: string) => {
    onUpdate(expenses.map(exp => 
      exp.id === id ? { ...exp, isRemoved: true } : exp
    ));
  };

  const handleRestoreExpense = (id: string) => {
    onUpdate(expenses.map(exp => 
      exp.id === id ? { ...exp, isRemoved: false } : exp
    ));
  };

  const activeExpenses = expenses.filter(e => !e.isRemoved);
  const removedExpenses = expenses.filter(e => e.isRemoved);
  const totalExpenses = activeExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const commonCategories = [
    'Maintenance',
    'Repairs',
    'Cleaning',
    'Laundry',
    'Internet',
    'Cable TV',
    'Parking',
    'Security',
    'Other',
  ];

  return (
    <div className="space-y-4">
      {/* Add New Expense */}
      <Card>
        <CardHeader>
          <CardTitle>Add Expense</CardTitle>
          <p className="text-sm text-gray-600">Add additional charges beyond rent and utilities</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select category</option>
                {commonCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="E.g., Plumbing repair"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="flex-1"
                />
                <Button
                  onClick={handleAddExpense}
                  disabled={!newExpense.category || !newExpense.description || !newExpense.amount || newExpense.amount <= 0}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Expenses List */}
      {activeExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Expenses</span>
              <Badge variant="secondary">{activeExpenses.length} item(s)</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Receipt className="h-4 w-4 text-orange-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-xs text-gray-600 capitalize">{expense.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-orange-600">
                      ₹{expense.amount.toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExpense(expense.id!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Removed Expenses (for recovery) */}
      {removedExpenses.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Removed Expenses</CardTitle>
            <p className="text-sm text-red-600">These expenses were removed and won't be included in the invoice</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {removedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-500 line-through">{expense.description}</p>
                    <p className="text-xs text-gray-400">{expense.category}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500 line-through">₹{expense.amount.toFixed(2)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreExpense(expense.id!)}
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {activeExpenses.length === 0 && removedExpenses.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No expenses added yet</p>
              <p className="text-sm text-gray-500 mt-1">Add expenses like maintenance, repairs, or additional services above</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total Summary */}
      {activeExpenses.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">Total Expenses</h3>
                <p className="text-sm text-gray-600">Sum of all additional charges</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-orange-600">
                  ₹{totalExpenses.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
