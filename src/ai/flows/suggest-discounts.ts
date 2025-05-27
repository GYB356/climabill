'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting dynamic discounts based on subscription level and usage history.
 *
 * - suggestDiscounts - A function that suggests discounts.
 * - SuggestDiscountsInput - The input type for the suggestDiscounts function.
 * - SuggestDiscountsOutput - The output type for the suggestDiscounts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDiscountsInputSchema = z.object({
  subscriptionLevel: z
    .string()
    .describe('The current subscription level of the user (e.g., Basic, Premium, Enterprise).'),
  usageHistory: z
    .string()
    .describe(
      'A summary of the user history and usage patterns in JSON format including key metrics.'
    ),
});
export type SuggestDiscountsInput = z.infer<typeof SuggestDiscountsInputSchema>;

const SuggestDiscountsOutputSchema = z.object({
  discountPercentage: z
    .number()
    .describe(
      'The suggested discount percentage to offer the user, between 0 and 100.  Should be a whole number.'
    ),
  reason: z
    .string()
    .describe(
      'A brief explanation of why this discount is being suggested. Should be one to two sentences.'
    ),
});
export type SuggestDiscountsOutput = z.infer<typeof SuggestDiscountsOutputSchema>;

export async function suggestDiscounts(input: SuggestDiscountsInput): Promise<SuggestDiscountsOutput> {
  return suggestDiscountsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDiscountsPrompt',
  input: {schema: SuggestDiscountsInputSchema},
  output: {schema: SuggestDiscountsOutputSchema},
  prompt: `You are an expert at customer retention and maximizing customer lifetime value.

You are provided with the user's subscription level and usage history. Based on this information, you will determine a discount percentage to offer the user to encourage continued engagement.

Subscription Level: {{{subscriptionLevel}}}
Usage History: {{{usageHistory}}}

Consider the following factors when determining the discount percentage:

- Users with higher subscription levels may warrant larger discounts.
- Users with declining usage may need a more significant discount to re-engage.
- Users with consistent usage may only need a small discount to maintain their engagement.

Output the discount as a percentage between 0 and 100 and provide a brief reason for the suggested discount. Be sure to output a whole number for the discount percentage.
`,
});

const suggestDiscountsFlow = ai.defineFlow(
  {
    name: 'suggestDiscountsFlow',
    inputSchema: SuggestDiscountsInputSchema,
    outputSchema: SuggestDiscountsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
