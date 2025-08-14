
'use client';

import { useState, useEffect } from 'react';
import { Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchRecommendations } from '@/app/actions';
import type { Product } from '@/lib/types';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ProductSheet } from './ProductSheet';

interface RecommendationsProps {
  products: Product[];
}

export default function Recommendations({ products }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const getRecs = async () => {
      setLoading(true);
      try {
        const recs = await fetchRecommendations();
        setRecommendations(recs);
      } catch (error) {
        console.error("Failed to fetch recommendations", error);
        setRecommendations([]); // Ensure it's an empty array on error
      } finally {
        setLoading(false);
      }
    };
    getRecs();
  }, []);
  
  const handleRecommendationClick = (rec: string) => {
    const product = products.find(p => p.name.toLowerCase() === rec.toLowerCase());
    if (product) {
      setSelectedProduct(product);
      setIsSheetOpen(true);
    }
  }

  if (loading) {
    return null; // Skeleton is handled by Suspense in HomeClient
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                 <Button
                    key={index}
                    variant="outline"
                    className="rounded-full bg-primary/20 hover:bg-primary/30 border-primary/30"
                    onClick={() => handleRecommendationClick(rec)}
                  >
                    {rec}
                  </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        <SheetContent className="w-full max-w-lg p-0">
            {selectedProduct && <ProductSheet product={selectedProduct} />}
        </SheetContent>
      </Sheet>
    </section>
  );
}
