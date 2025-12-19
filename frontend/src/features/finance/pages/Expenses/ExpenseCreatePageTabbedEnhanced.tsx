import React from 'react';
import { AppLayout } from '../../../../components/layout/AppLayout';
import ExpenseCreatePageTabbed from './ExpenseCreatePageTabbed';

const ExpenseCreatePageTabbedEnhanced: React.FC = () => {
  return (
    <AppLayout>
      <div className="py-8">
        <ExpenseCreatePageTabbed />
      </div>
    </AppLayout>
  );
};

export default ExpenseCreatePageTabbedEnhanced;