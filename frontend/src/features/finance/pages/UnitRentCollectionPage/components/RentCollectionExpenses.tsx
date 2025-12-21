import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input } from '@/componentDesignLibrary';
import { formatCurrency } from '@/utils/billingCalculations';
import type { ExpenseItem } from '../types';

interface RentCollectionExpensesProps {
  expenses: ExpenseItem[];
  newExpense: { category: string; description: string; amount: number };
  setNewExpense: (expense: { category: string; description: string; amount: number }) => void;
  onAddExpense: () => void;
  onRemoveExpense: (id: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
}

export const RentCollectionExpenses: React.FC<RentCollectionExpensesProps> = ({
  expenses,
  newExpense,
  setNewExpense,
  onAddExpense,
  onRemoveExpense,
  notes,
  setNotes
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Miscellaneous Expenses</span>
          <Badge variant="outline">{expenses.length} expense(s)</Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">Add any additional charges for this billing period</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Expense Form */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              <option value="Maintenance">🏠 Maintenance</option>
              <option value="Repairs">🔧 Repairs</option>
              <option value="Cleaning">🧹 Cleaning</option>
              <option value="Internet">🌐 Internet</option>
              <option value="Parking">🚗 Parking</option>
              <option value="Late Fee">⏰ Late Fee</option>
              <option value="Security">🔒 Security</option>
              <option value="Other">📝 Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <Input
              placeholder="e.g., Plumbing repair, WiFi charges"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Amount (₹)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={newExpense.amount || ''}
              onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
              className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={onAddExpense}
              disabled={!newExpense.category || !newExpense.description || !newExpense.amount}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Expenses List */}
        {expenses.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Category</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Description</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">Amount</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{expense.category}</td>
                    <td className="px-4 py-2">{expense.description}</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => expense.id && onRemoveExpense(expense.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Remarks</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes for this invoice..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24"
          />
        </div>
      </CardContent>
    </Card>
  );
};
