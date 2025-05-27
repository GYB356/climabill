
'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting dynamic discounts and subscription plans based on subscription level and usage history.
 *
 * - suggestDiscounts - A function that suggests discounts and a plan.
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
      'The suggested discount percentage to offer the user, between 0 and 100. Should be a whole number.'
    ),
  recommendedPlan: z
    .string()
    .describe('The recommended subscription plan for the user (e.g., Basic, Pro, Enterprise).'),
  reason: z
    .string()
    .describe(
      'A brief explanation of why this discount and plan are being suggested. Should be one to two sentences.'
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
You are provided with the user's current subscription level and usage history. The available subscription plans are "Basic", "Pro", and "Enterprise".

Based on this information, you will:
1. Determine a discount percentage to offer the user to encourage continued engagement or upgrade.
2. Recommend an appropriate subscription plan (Basic, Pro, or Enterprise) for the user.
3. Provide a brief reason for the suggested discount and plan recommendation.

Subscription Level: {{{subscriptionLevel}}}
Usage History: {{{usageHistory}}}

Consider the following factors:
- Users with higher subscription levels might warrant larger discounts if their usage is declining or if an upgrade to a higher tier is being suggested.
- Users with declining usage may need a more significant discount to re-engage or might be candidates for a lower-tier plan if they are oversubscribed.
- Users with consistent high usage on a lower tier might be candidates for an upgrade to "Pro" or "Enterprise", possibly with an introductory discount.
- Users happy with their current tier and usage might only need a small retention discount.

Output the discount as a percentage between 0 and 100 (whole number).
Output the recommended plan as one of "Basic", "Pro", or "Enterprise".
Provide a brief reason covering both the discount and plan suggestion.
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

