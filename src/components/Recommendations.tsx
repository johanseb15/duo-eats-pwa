'use client';

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from './ui/skeleton';
import { fetchRecommendations } from '@/app/actions';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = async () => {
    setIsClicked(true);
    setLoading(true);
    const recs = await fetchRecommendations();
    setRecommendations(recs);
    setLoading(false);
  };

  if (!isClicked) {
    return (
      <section className="mb-12 text-center">
        <Button onClick={handleClick} size="lg" className="rounded-full">
          <Wand2 className="mr-2 h-5 w-5" /> Get AI Recommendations
        </Button>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <Card className="bg-card/80 backdrop-blur-sm border-primary border-dashed">
        <CardHeader>
          <CardTitle className="font-headline text-3xl font-semibold flex items-center gap-3">
            <Wand2 className="h-8 w-8 text-primary" />
            For You
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full hidden sm:block" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="bg-primary/20 text-primary-foreground font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-primary/40 transition-colors"
                >
                  {rec}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
