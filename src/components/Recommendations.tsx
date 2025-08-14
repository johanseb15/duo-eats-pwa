
'use client';

import { useState, useEffect } from 'react';
import { Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from './ui/skeleton';
import { fetchRecommendations } from '@/app/actions';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRecs = async () => {
      setLoading(true);
      const recs = await fetchRecommendations();
      setRecommendations(recs);
      setLoading(false);
    };
    getRecs();
  }, []);

  // Skeleton is handled by Suspense in HomeClient now
  if (loading) {
    return null;
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <Card className="bg-card/60 backdrop-blur-xl border-primary/50 border-dashed">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <Wand2 className="h-6 w-6 text-primary" />
            Recomendado para ti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-primary/20 text-primary-foreground font-semibold px-4 py-2 rounded-full cursor-default"
              >
                {rec}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
