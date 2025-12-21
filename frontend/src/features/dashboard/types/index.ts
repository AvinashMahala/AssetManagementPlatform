export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeVariant: 'default' | 'destructive' | 'secondary';
  onClick: (navigate: (path: string) => void) => void;
}
