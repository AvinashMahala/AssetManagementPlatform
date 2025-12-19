import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { formatCurrency } from '../../utils/billingCalculations';

interface CalendarTransaction {
  id: string;
  unitId: string;
  unitNumber: string;
  amount: number;
  amountPaid: number;
  status: 'draft' | 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate?: string;
}

interface RentCollectionCalendarProps {
  transactions: CalendarTransaction[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onTransactionClick?: (transaction: CalendarTransaction) => void;
  billingMethod?: 'relative' | 'fixed';
  onBillingMethodChange?: (method: 'relative' | 'fixed') => void;
  className?: string;
}

export const RentCollectionCalendar: React.FC<RentCollectionCalendarProps> = ({
  transactions,
  selectedDate,
  onDateSelect,
  onTransactionClick,
  billingMethod = 'relative',
  onBillingMethodChange,
  className = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  // Get all days in the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group transactions by date
  const transactionsByDate = useMemo(() => {
    const grouped: Record<string, CalendarTransaction[]> = {};

    transactions.forEach(transaction => {
      // Use due date for rent collection calendar - this is when rent is due for collection
      const dueDate = transaction.dueDate || transaction.billingPeriodEnd;
      if (!dueDate) return; // Skip if no due date available
      
      const dateKey = format(new Date(dueDate), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });

    return grouped;
  }, [transactions]);

  // Get transactions for a specific date
  const getTransactionsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return transactionsByDate[dateKey] || [];
  };

  // Calculate totals for a date
  const getDateTotals = (date: Date) => {
    const dayTransactions = getTransactionsForDate(date);
    return {
      total: dayTransactions.reduce((sum, t) => sum + t.amount, 0),
      collected: dayTransactions.reduce((sum, t) => sum + (t.amountPaid || 0), 0),
      count: dayTransactions.length,
      status: dayTransactions.length > 0 ? getOverallStatus(dayTransactions) : null
    };
  };

  // Get overall status for multiple transactions on a date
  const getOverallStatus = (transactions: CalendarTransaction[]) => {
    if (transactions.some(t => t.status === 'overdue')) return 'overdue';
    if (transactions.some(t => t.status === 'partial')) return 'partial';
    if (transactions.some(t => t.status === 'paid')) return 'paid';
    if (transactions.some(t => t.status === 'pending')) return 'pending';
    if (transactions.some(t => t.status === 'cancelled')) return 'cancelled';
    return 'draft';
  };

  // Get status color and icon
  const getStatusInfo = (status: string | null) => {
    switch (status) {
      case 'paid':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, iconColor: 'text-green-600' };
      case 'partial':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: DollarSign, iconColor: 'text-yellow-600' };
      case 'overdue':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle, iconColor: 'text-red-600' };
      case 'pending':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CalendarIcon, iconColor: 'text-blue-600' };
      case 'draft':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Clock, iconColor: 'text-purple-600' };
      case 'cancelled':
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle, iconColor: 'text-gray-600' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CalendarIcon, iconColor: 'text-gray-600' };
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
  };

  const handleTransactionClick = (transaction: CalendarTransaction, e: React.MouseEvent) => {
    e.stopPropagation();
    onTransactionClick?.(transaction);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Rent Due Dates Calendar
          </CardTitle>
          <div className="flex items-center gap-4">
            {/* Billing Method Selector */}
            {onBillingMethodChange && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Billing:</span>
                <select
                  value={billingMethod}
                  onChange={(e) => onBillingMethodChange(e.target.value as 'relative' | 'fixed')}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="relative">Date-to-Date</option>
                  <option value="fixed">1st of Month</option>
                </select>
              </div>
            )}

            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold min-w-[140px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
                className="ml-2"
              >
                Today
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            const dayTransactions = getTransactionsForDate(date);
            const totals = getDateTotals(date);
            const statusInfo = getStatusInfo(totals.status);
            const StatusIcon = statusInfo.icon;

            const hasOverdue = dayTransactions.some(t => t.status === 'overdue');
            const isSelected = isSameDay(date, selectedDate);
            const isCurrentDay = isToday(date);

            return (
              <div
                key={index}
                className={`
                  min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md
                  ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'}
                  ${!isSameMonth(date, currentMonth) ? 'text-gray-400 bg-gray-50' : ''}
                  ${isCurrentDay ? 'border-blue-300' : 'border-gray-200'}
                  ${hasOverdue ? 'border-red-300 bg-red-50' : ''}
                `}
                onClick={() => handleDateClick(date)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${isCurrentDay ? 'text-blue-600' : ''}`}>
                    {format(date, 'd')}
                  </span>
                  {totals.count > 0 && (
                    <Badge variant="outline" className={`text-xs ${statusInfo.color}`}>
                      {totals.count}
                    </Badge>
                  )}
                </div>

                {totals.total > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-900">
                      {formatCurrency(totals.total)}
                    </div>
                    {totals.collected > 0 && (
                      <div className="text-xs text-green-600">
                        {formatCurrency(totals.collected)} paid
                      </div>
                    )}
                    {totals.status && (
                      <div className={`flex items-center gap-1 text-xs ${statusInfo.iconColor}`}>
                        <StatusIcon className="h-3 w-3" />
                        <span className="capitalize">{totals.status}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Transaction details on hover/selection */}
                {isSelected && dayTransactions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {dayTransactions.slice(0, 3).map(transaction => (
                      <div
                        key={transaction.id}
                        className="text-xs p-1 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                        onClick={(e) => handleTransactionClick(transaction, e)}
                      >
                        <div className="font-medium">Unit {transaction.unitNumber}</div>
                        <div className="text-gray-600">{formatCurrency(transaction.amount)}</div>
                      </div>
                    ))}
                    {dayTransactions.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayTransactions.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border-2 border-red-300 rounded"></div>
            <span className="font-medium">Overdue (highlighted)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span>Paid</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div>
            <span>Draft</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
            <span>Cancelled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};