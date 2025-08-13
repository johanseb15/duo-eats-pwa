
'use client';

import { useState, useEffect } from 'react';
import { Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from './ui/skeleton';
import { fetchRecommendations } from '@/app/actions';
import type { Product } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface RecommendationsProps {
    products: Product[];
}


export default function Recommendations({ products }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getRecs = async () => {
      setLoading(true);
      const recs = await fetchRecommendations();
      setRecommendations(recs);
      setLoading(false);
    };
    getRecs();
  }, []);

  const handleRecommendationClick = (rec: string) => {
    const product = products.find(p => p.name.toLowerCase() === rec.toLowerCase());
    if (product) {
      router.push(`/product/${product.id}`);
    }
  };

  if (loading) {
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
              <Skeleton className="h-10 w-40 bg-muted/50 rounded-full" />
              <Skeleton className="h-10 w-32 bg-muted/50 rounded-full" />
              <Skeleton className="h-10 w-48 bg-muted/50 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </section>
    );
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
                onClick={() => handleRecommendationClick(rec)}
                className="bg-primary/20 text-primary-foreground font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-primary/40 transition-colors"
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
