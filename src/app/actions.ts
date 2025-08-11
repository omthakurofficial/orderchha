'use server';

import { suggestCombos } from '@/ai/flows/suggest-combos';
import { MENU } from '@/lib/data';

export async function getSuggestions() {
  try {
    const customerPreferences = 'Loves pepperoni pizza, often orders coke. Sometimes gets a salad. Prefers spicy food.';

    const menuString = MENU.map(
      (category) =>
        `Category: ${category.name}\nItems:\n${category.items
          .map((item) => `- ${item.name}`)
          .join('\n')}`
    ).join('\n\n');

    const result = await suggestCombos({
      customerPreferences,
      menu: menuString,
    });
    
    const suggestionsList = result.suggestions.split('\n').filter(s => {
        const trimmed = s.trim();
        return trimmed.length > 0 && (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed));
    }).map(s => s.trim().replace(/^(-|\*|\d+\.)\s*/, ''));
    
    if (suggestionsList.length === 0) {
        return { error: 'No suggestions could be generated at this time.' };
    }

    return { suggestions: suggestionsList };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to get suggestions due to a server error.' };
  }
}
