import React from 'react';
import { Card } from '../../../components/ui';
import { Badge } from '../../../components/ui';
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
  <Card className="activity-card p-3">
    <div className="flex items-center justify-between mb-2">
      <div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="space-y-2" role="list">
      {items.length > 0 ? (
        items.map((item) => (
          <div
            key={item.id}
            role="listitem"
            className="flex items-center justify-between py-1 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 px-1 rounded transition-colors"
            onClick={item.onClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.onClick(); } }}
            tabIndex={0}
            aria-label={`${item.title}: ${item.subtitle}, status: ${item.badge}`}
          >
            <div>
              <p className="text-xs font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            <Badge variant={item.badgeVariant} className="text-xs px-1 py-0">
              {item.badge}
            </Badge>
          </div>
        ))
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">
          {emptyMessage}
        </p>
      )}
    </div>
  </Card>
);

export default React.memo(ActivityCard);