import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useMeter,
  useMeterReadings,
  useMeterTrend,
  useMeterStatistics,
  useDeleteMeter
} from '../../hooks';
import navigateBackOrFallback from '../../utils/navigation';
import { AppLayout } from '../../components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  MeterDetailHeader,
  MeterStatusCards,
  MeterInfoCard,
  MeterLatestReadingCard,
  MeterReadingsHistory,
  MeterAnalytics
} from './components/MeterDetail';
import { MeterLoading, MeterError } from './components/shared';

export const MeterDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: meter, loading: loadingMeter, error: meterError } = useMeter(id!);
  const { data: readingsData } = useMeterReadings(id!);
  const { data: trendData } = useMeterTrend(id!, 12);
  const { data: statistics } = useMeterStatistics(id!);
  const { mutate: deleteMeter, loading: deleting } = useDeleteMeter();

  const [activeTab, setActiveTab] = useState('overview');

  const handleDelete = async () => {
    if (!id) return;

    if (window.confirm('Are you sure you want to delete this meter? This action cannot be undone and will delete all associated readings.')) {
      try {
        await deleteMeter(id);
        // Use centralized navigation helper; preserve success state when falling back
        navigateBackOrFallback(navigate, '/meters', { state: { message: 'Meter deleted successfully!' } });
      } catch (err) {
        console.error('Failed to delete meter:', err);
        alert('Failed to delete meter');
      }
    }
  };

  if (loadingMeter) {
    return (
      <AppLayout title="Meter Details">
        <MeterLoading message="Loading meter details..." />
      </AppLayout>
    );
  }

  if (meterError || !meter) {
    return (
      <AppLayout title="Meter Details">
        <MeterError 
          title="Meter Not Found" 
          message="The meter you're looking for doesn't exist or has been deleted." 
        />
      </AppLayout>
    );
  }

  const readings = readingsData?.readings || [];
  const trend = trendData?.trend || [];
  const stats = statistics || {};

  return (
    <AppLayout title={`${meter.meterName} - Details`}>
      <div className="space-y-6">
        <MeterDetailHeader
          meterName={meter.meterName}
          meterId={meter.id}
          onBack={() => navigateBackOrFallback(navigate, '/meters')}
          onEdit={() => navigate(`/meters/${id}/edit`)}
          onAddReading={() => navigate(`/meters/${id}/readings/create`)}
          onDelete={handleDelete}
          deleting={deleting}
        />

        <MeterStatusCards
          meter={meter}
          readingsCount={readings.length}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="readings">Readings History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MeterInfoCard meter={meter} />
              <MeterLatestReadingCard reading={readings[0]} />
            </div>
          </TabsContent>

          <TabsContent value="readings" className="space-y-6">
            <MeterReadingsHistory readings={readings} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <MeterAnalytics trend={trend} stats={stats} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};
