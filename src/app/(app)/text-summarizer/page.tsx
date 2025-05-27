
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, NotebookText, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SummarizeTextInput, SummarizeTextOutput } from "@/ai/flows/summarize-text-flow";
import { summarizeText } from "@/ai/flows/summarize-text-flow"; // Server Action

const formSchema = z.object({
  textToSummarize: z.string().min(50, {
    message: "Text to summarize must be at least 50 characters.",
  }).max(10000, {
    message: "Text to summarize must not exceed 10,000 characters."
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function TextSummarizerPage() {
  const [isPending, startTransition] = useTransition();
  const [summaryResult, setSummaryResult] = useState<SummarizeTextOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      textToSummarize: "",
    },
  });

  function onSubmit(values: FormValues) {
    setSummaryResult(null);
    startTransition(async () => {
      try {
        const result = await summarizeText(values as SummarizeTextInput);
        setSummaryResult(result);
        toast({
          title: "Text Summarized!",
          description: "AI has generated a summary for your text.",
        });
      } catch (error) {
        console.error("Error summarizing text:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to summarize text. Please try again.",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <NotebookText className="mr-3 h-8 w-8 text-primary" />
          Text Summarizer
        </h1>
        <p className="text-muted-foreground">
          Paste your text below and let AI generate a concise summary.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Input Text</CardTitle>
              <CardDescription>Enter the text you want to summarize.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="textToSummarize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="textToSummarizeInput" className="sr-only">Text to Summarize</FormLabel>
                    <FormControl>
                      <Textarea
                        id="textToSummarizeInput"
                        placeholder="Paste your long text here... (min 50 characters)"
                        className="min-h-[200px] text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The AI will process this text to create a summary.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Button type="submit" disabled={isPending} size="lg" className="w-full md:w-auto">
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            Summarize Text
          </Button>
        </form>
      </Form>

      {isPending && (
        <Card className="shadow-lg animate-pulse">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Generating Summary...</CardTitle>
            <CardDescription>Our AI is processing the text. This might take a moment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </CardContent>
        </Card>
      )}

      {summaryResult && !isPending && (
        <Card className="shadow-xl border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-accent" />
              Generated Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              value={summaryResult.summary}
              readOnly
              className="min-h-[150px] text-sm bg-background/70 cursor-default"
              aria-label="Generated Summary"
            />
            <p className="text-xs text-muted-foreground">This summary was generated by AI.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
