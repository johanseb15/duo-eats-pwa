'use server';

import { getPersonalizedRecommendations } from '@/ai/flows/personalized-recommendations';

export async function fetchRecommendations() {
  try {
    const result = await getPersonalizedRecommendations({
      userOrderHistory: '["Pizza", "Coke"]',
      userPreferences: '["Spicy", "Vegetarian"]',
    });
    // The AI returns a string that looks like an array. We need to parse it.
    const recommendationsArray = JSON.parse(result.recommendations);
    return recommendationsArray as string[];
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    // Fallback recommendations
    return ['Spicy Veggie Pizza', 'Chilli Paneer', 'Gobi Manchurian'];
  }
}
