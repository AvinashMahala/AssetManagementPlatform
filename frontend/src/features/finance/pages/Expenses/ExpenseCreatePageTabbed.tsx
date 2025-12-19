import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateExpense } from '../../../../hooks';
import { useNotifications } from '../../../../contexts';
import ExpenseFormTabbed from '../../../../components/forms/ExpenseFormTabbed';
import type { ExpenseInput } from '../../../../types/expense';

const ExpenseCreatePageTabbed: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createExpense, loading } = useCreateExpense();
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async (data: ExpenseInput) => {
    try {
      const response = await createExpense(data);
      if (response.success && response.data) {
        // Navigate to the created expense's detail page if id is present, else go back to list
        const newId = (response.data as any).id;
        showSuccess('Expense created successfully!');
        navigate(newId ? `/expenses/${newId}` : '/expenses');
      } else {
        showError(response.error?.message || 'Failed to create expense');
      }
    } catch (err) {
      console.error('Create expense failed', err);
      showError('Failed to create expense. Please try again.');
    }
  };

  return (
    <ExpenseFormTabbed
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
};

export default ExpenseCreatePageTabbed;