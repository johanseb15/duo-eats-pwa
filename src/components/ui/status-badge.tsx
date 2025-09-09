import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'order' | 'payment' | 'delivery';
  className?: string;
}

export function StatusBadge({ status, variant = 'default', className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    if (variant === 'order') {
      switch (status) {
        case 'Entregado':
          return 'bg-green-500 hover:bg-green-600 text-white';
        case 'Cancelado':
          return 'bg-red-500 hover:bg-red-600 text-white';
        case 'En preparación':
          return 'bg-blue-500 hover:bg-blue-600 text-white';
        case 'En camino':
          return 'bg-orange-500 hover:bg-orange-600 text-white';
        case 'Pendiente':
          return 'bg-yellow-500 hover:bg-yellow-600 text-white';
        default:
          return 'bg-gray-500 hover:bg-gray-600 text-white';
      }
    }
    
    if (variant === 'delivery') {
      switch (status) {
        case 'active':
          return 'bg-green-500 hover:bg-green-600 text-white';
        case 'inactive':
          return 'bg-gray-500 hover:bg-gray-600 text-white';
        default:
          return 'bg-gray-500 hover:bg-gray-600 text-white';
      }
    }
    
    return 'bg-primary hover:bg-primary/90 text-primary-foreground';
  };

  return (
    <Badge className={cn(getStatusStyles(), 'transition-colors duration-200', className)}>
      {status}
    </Badge>
  );
}