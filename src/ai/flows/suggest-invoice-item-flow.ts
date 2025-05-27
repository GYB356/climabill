
'use server';
/**
 * @fileOverview A Genkit flow for suggesting invoice item details.
 *
 * - suggestInvoiceItem - A function that takes a service description and returns suggested invoice item details.
 * - SuggestInvoiceItemInput - The input type for the suggestInvoiceItem function.
 * - SuggestInvoiceItemOutput - The return type for the suggestInvoiceItem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestInvoiceItemInputSchema = z.object({
  serviceDescription: z.string().min(10, { message: "Service description must be at least 10 characters long." }).describe('A brief description of the service or product provided.'),
});
export type SuggestInvoiceItemInput = z.infer<typeof SuggestInvoiceItemInputSchema>;

const SuggestInvoiceItemOutputSchema = z.object({
  suggestedItemName: z.string().describe('A concise and professional name for the invoice item.'),
  suggestedItemDescription: z.string().describe('A clear, brief description for the invoice item (1-2 sentences).'),
  suggestedUnitPrice: z.number().describe('A plausible numerical unit price for the item. Provide just the number.'),
});
export type SuggestInvoiceItemOutput = z.infer<typeof SuggestInvoiceItemOutputSchema>;

export async function suggestInvoiceItem(input: SuggestInvoiceItemInput): Promise<SuggestInvoiceItemOutput> {
  return suggestInvoiceItemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInvoiceItemPrompt',
  input: {schema: SuggestInvoiceItemInputSchema},
  output: {schema: SuggestInvoiceItemOutputSchema},
  prompt: `You are an expert billing assistant. Based on the provided service description, suggest:
1. A concise and professional item name.
2. A clear item description (1-2 sentences).
3. A plausible unit price for an invoice. The unit price should be a numerical value, without currency symbols.

Service Description:
{{{serviceDescription}}}
`,
});

const suggestInvoiceItemFlow = ai.defineFlow(
  {
    name: 'suggestInvoiceItemFlow',
    inputSchema: SuggestInvoiceItemInputSchema,
    outputSchema: SuggestInvoiceItemOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
