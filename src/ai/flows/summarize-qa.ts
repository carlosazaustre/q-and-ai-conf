// SummarizeQAStory - src/ai/flows/summarize-qa.ts
'use server';
/**
 * @fileOverview Summarizes Q&A sessions for conference attendees.
 *
 * - summarizeQA - A function that summarizes the Q&A content.
 * - SummarizeQAInput - The input type for the summarizeQA function.
 * - SummarizeQAOutput - The return type for the summarizeQA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeQAInputSchema = z.object({
  qaContent: z
    .string()
    .describe('The Q&A content to summarize.'),
});
export type SummarizeQAInput = z.infer<typeof SummarizeQAInputSchema>;

const SummarizeQAOutputSchema = z.object({
  summary: z.string().describe('The summary of the Q&A content.'),
});
export type SummarizeQAOutput = z.infer<typeof SummarizeQAOutputSchema>;

export async function summarizeQA(input: SummarizeQAInput): Promise<SummarizeQAOutput> {
  return summarizeQAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeQAPrompt',
  input: {schema: SummarizeQAInputSchema},
  output: {schema: SummarizeQAOutputSchema},
  prompt: `You are an AI assistant summarizing a Q&A session from a conference.
  Please provide a concise summary of the key topics and insights discussed.

  Q&A Content: {{{qaContent}}}`,
});

const summarizeQAFlow = ai.defineFlow(
  {
    name: 'summarizeQAFlow',
    inputSchema: SummarizeQAInputSchema,
    outputSchema: SummarizeQAOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
