import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'form' | 'list';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ variant = 'card', count = 3, className }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'table':
        return (
          <div className="space-y-3">
            <div className="flex space-x-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 flex-1" />
              ))}
            </div>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-12 flex-1" />
                ))}
              </div>
            ))}
          </div>
        );
      
      case 'form':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        );
      
      case 'list':
        return (
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        );
      
      default:
        return <Skeleton className="h-32 w-full" />;
    }
  };

  return (
    <div className={cn("animate-pulse", className)}>
      {renderSkeleton()}
    </div>
  );
}