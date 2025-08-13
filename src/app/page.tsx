
import { collection, getDocs, orderBy, query as firestoreQuery } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, Promotion, ProductCategoryData } from '@/lib/types';
import HomeClient from '@/components/HomeClient';

async function getProducts(): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    const q = firestoreQuery(productsCol, orderBy('name'));
    const productsSnapshot = await getDocs(q);
    
    const productList = productsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        aiHint: data.aiHint,
        category: data.category,
        options: data.options,
      } as Product;
    });
    return productList;
  } catch (error) {
    console.error("Error fetching products:", error);
    // This can happen if Firestore is not set up correctly
    // or if the security rules are too restrictive.
    return [];
  }
}

async function getPromotions(): Promise<Promotion[]> {
    try {
      const promotionsCol = collection(db, 'promotions');
      const promotionsSnapshot = await getDocs(promotionsCol);
      
      const promotionList = promotionsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              title: data.title,
              description: data.description,
              image: data.image,
              aiHint: data.aiHint,
          } as Promotion;
      });
      return promotionList;
    } catch (error) {
      console.error("Error fetching promotions:", error);
      return [];
    }
}

async function getCategories(): Promise<ProductCategoryData[]> {
    try {
      const categoriesCol = collection(db, 'categories');
      const q = firestoreQuery(categoriesCol, orderBy('name'));
      const categoriesSnapshot = await getDocs(q);

      const categoryList = categoriesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              name: data.name,
              slug: data.slug,
              icon: data.icon || 'Package',
          } as ProductCategoryData;
      });
      return categoryList;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
}


export default async function Home() {
  const products = await getProducts();
  const promotions = await getPromotions();
  const categories = await getCategories();
  
  return <HomeClient products={products} promotions={promotions} categories={categories} />;
}
