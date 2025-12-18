import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import type { ListCardProps } from './types';
import './ListCard.scss';

export function ListCard({
  title,
  description,
  icon,
  items,
  emptyMessage = 'No items found',
  className = ''
}: ListCardProps) {
  return (
    <Card className={`list-card p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="space-y-2" role="list">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              role="listitem"
              className={`flex items-center justify-between py-1 border-b last:border-b-0 px-1 rounded transition-colors ${
                item.onClick ? 'cursor-pointer hover:bg-muted/50' : ''
              }`}
              onClick={item.onClick}
              onKeyDown={(e) => {
                if (item.onClick && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  item.onClick();
                }
              }}
              tabIndex={item.onClick ? 0 : undefined}
            >
              <div>
                <p className="text-xs font-medium">{item.title}</p>
                {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
              </div>
              {item.badge && (
                <Badge variant={item.badge.variant} className="text-xs px-1 py-0">
                  {item.badge.label}
                </Badge>
              )}
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
}