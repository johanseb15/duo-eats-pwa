
'use server';

/**
 * @fileoverview A store assistant AI agent that can answer questions about the restaurant.
 *
 * - chat - A function that handles the chat with the assistant.
 * - StoreAssistantInput - The input type for the chat function.
 * - StoreAssistantOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchRestaurantSettings } from '@/app/actions';

export const StoreAssistantInputSchema = z.object({
  query: z.string().describe('The user\'s question.'),
});
export type StoreAssistantInput = z.infer<typeof StoreAssistantInputSchema>;

export const StoreAssistantOutputSchema = z.object({
  answer: z.string().describe('The assistant\'s answer.'),
});
export type StoreAssistantOutput = z.infer<typeof StoreAssistantOutputSchema>;

// Tool to get restaurant settings
const getRestaurantInfoTool = ai.defineTool(
    {
      name: 'getRestaurantInfo',
      description: 'Get information about the restaurant, such as opening hours, open days, and contact number.',
      inputSchema: z.object({}),
      outputSchema: z.any(),
    },
    async () => {
        const settings = await fetchRestaurantSettings();
        if (!settings) return "No settings found.";
        return `The restaurant is open on ${settings.openDays.join(', ')} from ${settings.openingTime} to ${settings.closingTime}. The contact WhatsApp number is ${settings.whatsappNumber}.`;
    }
);


const storeAssistantFlow = ai.defineFlow(
  {
    name: 'storeAssistantFlow',
    inputSchema: StoreAssistantInputSchema,
    outputSchema: StoreAssistantOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
      prompt: `You are a friendly and helpful store assistant for a restaurant called "Duo Eats".
      Your goal is to answer customer questions based on the information you have.
      Use the available tools to get the most up-to-date information.
      
      User query: "${input.query}"`,
      tools: [getRestaurantInfoTool],
      model: 'googleai/gemini-2.0-flash',
    });

    return {
      answer: llmResponse.text,
    };
  }
);


export async function chat(input: StoreAssistantInput): Promise<StoreAssistantOutput> {
    return await storeAssistantFlow(input);
}
