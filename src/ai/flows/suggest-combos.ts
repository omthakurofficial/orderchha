// AI combo suggestion flow using Genkit.
'use server';
/**
 * @fileOverview An AI agent that suggests combos and deals tailored to customer preferences.
 *
 * - suggestCombos - A function that suggests combos and deals.
 * - SuggestCombosInput - The input type for the suggestCombos function.
 * - SuggestCombosOutput - The return type for the suggestCombos function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCombosInputSchema = z.object({
  customerPreferences: z
    .string()
    .describe('The customer\u2019s order history and preferences.'),
  menu: z.string().describe('The current menu items with prices.'),
});
export type SuggestCombosInput = z.infer<typeof SuggestCombosInputSchema>;

const SuggestCombosOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('A list of suggested combos and deals tailored to the customer\u2019s preferences.'),
});
export type SuggestCombosOutput = z.infer<typeof SuggestCombosOutputSchema>;

export async function suggestCombos(input: SuggestCombosInput): Promise<SuggestCombosOutput> {
  return suggestCombosFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCombosPrompt',
  input: {schema: SuggestCombosInputSchema},
  output: {schema: SuggestCombosOutputSchema},
  prompt: `You are a restaurant AI assistant that suggests combos and deals to customers based on their preferences and the current menu.

  Customer Preferences: {{{customerPreferences}}}
  Menu: {{{menu}}}

  Please provide a list of suggested combos and deals tailored to the customer\u2019s preferences.
  Format the output as a list.
  Do not include any introductory or concluding remarks.
  Do not include prices in the suggested combos.
  Do not suggest items that are not on the menu.
  `,
});

const suggestCombosFlow = ai.defineFlow(
  {
    name: 'suggestCombosFlow',
    inputSchema: SuggestCombosInputSchema,
    outputSchema: SuggestCombosOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
