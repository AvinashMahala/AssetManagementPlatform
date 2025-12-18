import React from 'react';
import { ListCard } from '../../../componentDesignLibrary/components/list-card';
import './ActivityCard.scss';

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeVariant: 'default' | 'destructive' | 'secondary';
  onClick: () => void;
}

interface ActivityCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ActivityItem[];
  emptyMessage: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  description,
  icon: Icon,
  items,
  emptyMessage,
}) => (
  <ListCard
    title={title}
    description={description}
    icon={<Icon className="h-4 w-4 text-muted-foreground" />}
    items={items.map(item => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      badge: { label: item.badge, variant: item.badgeVariant },
      onClick: item.onClick
    }))}
    emptyMessage={emptyMessage}
    className="activity-card"
  />
);

export default React.memo(ActivityCard);