import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useUnit } from '@/features/units/hooks/useUnits';
import { useProperty } from '@/features/properties/hooks/useProperties';
import { useLeases } from '@/features/leases/hooks/useLeases';
import { useUnitUtilities } from '@/features/units/hooks/useUnitUtilities';
import { useLastMeterReadings, useUnitTransactionHistory } from '@/features/finance/hooks/useRentTransactions';

export const useRentCollectionData = () => {
  const { propertyId, unitId } = useParams<{ propertyId: string; unitId: string }>();

  const { data: unit, loading: unitLoading } = useUnit(unitId!);
  const { data: property, loading: propertyLoading } = useProperty(propertyId!);
  const { data: lastMeterReadings, loading: readingsLoading } = useLastMeterReadings(unitId!);
  const { utilities, loading: utilitiesLoading } = useUnitUtilities(unitId, propertyId);
  const { leases, loading: leasesLoading } = useLeases(unitId);
  const { history: recentInvoices, loading: historyLoading, refetch: refetchHistory } = useUnitTransactionHistory(unitId!, 5);

  // Get active lease for the unit
  const activeLease = useMemo(() => leases.find(lease => 
    lease.status === 'active' && 
    lease.unitId === unitId
  ), [leases, unitId]);

  const isLoading = unitLoading || propertyLoading || readingsLoading || utilitiesLoading || leasesLoading || historyLoading;

  return {
    propertyId,
    unitId,
    unit,
    property,
    utilities,
    leases,
    activeLease,
    lastMeterReadings,
    recentInvoices,
    refetchHistory,
    isLoading,
    readingsLoading,
    utilitiesLoading,
    historyLoading
  };
};
