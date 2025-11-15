import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useExpense, useUpdateExpense } from '../../hooks';
import { Button } from '../../components/ui/button';
import { AppLayout } from '../../components/layout/AppLayout';
import ExpenseFormTabbed from '../../components/forms/ExpenseFormTabbed';
import type { ExpenseInput } from '../../types/expense';

export const ExpenseEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: expense, loading: loadingExpense, error: expenseError } = useExpense(id!);
  const { mutate: updateExpense, loading: updating } = useUpdateExpense();

  const handleSubmit = async (data: ExpenseInput) => {
    if (!id) return;

    try {
      await updateExpense({ id, data });
      navigate('/expenses', {
        state: { message: 'Expense updated successfully!' }
      });
    } catch (error) {
      console.error('Failed to update expense:', error);
      throw error; // Re-throw to let the form handle it
    }
  };

  if (loadingExpense) {
    return (
      <AppLayout title="Edit Expense">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading expense...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (expenseError || !expense) {
    return (
      <AppLayout title="Edit Expense">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Expense Not Found</h2>
            <p className="text-gray-600 mb-4">The expense you're trying to edit doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/expenses')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Expenses
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Expense">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/expenses')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Expenses
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Expense</h1>
            <p className="mt-2 text-gray-600">Update expense record details</p>
          </div>
        </div>

        <ExpenseFormTabbed
          initialData={expense}
          onSubmit={handleSubmit}
          loading={updating}
          isEdit={true}
        />
      </div>
    </AppLayout>
  );
};