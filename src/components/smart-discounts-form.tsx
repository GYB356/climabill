
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Briefcase } from "lucide-react"; // Added Briefcase for plan
import { useToast } from "@/hooks/use-toast";
import type { SuggestDiscountsInput, SuggestDiscountsOutput } from "@/ai/flows/suggest-discounts";
import { suggestDiscounts } from "@/ai/flows/suggest-discounts"; // Server Action

const formSchema = z.object({
  subscriptionLevel: z.string().min(2, {
    message: "Subscription level must be at least 2 characters.",
  }).max(50, {
    message: "Subscription level must not exceed 50 characters.",
  }),
  usageHistory: z.string().min(10, {
    message: "Usage history must be at least 10 characters.",
  }).max(1000, {
    message: "Usage history must not exceed 1000 characters."
  }).refine(value => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }, { message: "Usage history must be valid JSON." }),
});

type FormValues = z.infer<typeof formSchema>;

export function SmartDiscountsForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SuggestDiscountsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subscriptionLevel: "",
      usageHistory: `{\n  "loginsLast30Days": 25,\n  "featuresUsed": ["dashboard", "reporting"],\n  "supportTickets": 1,\n  "accountAgeMonths": 12\n}`,
    },
  });

  function onSubmit(values: FormValues) {
    setResult(null);
    startTransition(async () => {
      try {
        const discountSuggestion = await suggestDiscounts(values as SuggestDiscountsInput);
        setResult(discountSuggestion);
        toast({
          title: "Discount & Plan Suggested!",
          description: `AI recommended a ${discountSuggestion.discountPercentage}% discount and the "${discountSuggestion.recommendedPlan}" plan.`,
        });
      } catch (error) {
        console.error("Error suggesting discount:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get discount suggestion. Please try again.",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Discount Parameters</CardTitle>
              <CardDescription>Provide user details to get an AI-powered discount and plan suggestion.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="subscriptionLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Level</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Basic, Premium, Enterprise" {...field} />
                    </FormControl>
                    <FormDescription>
                      The user's current subscription plan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usageHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage History (JSON format)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"loginsLast30Days": 25, "featuresUsed": ["dashboard"], ...}'
                        className="min-h-[150px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A JSON summary of the user's history and usage patterns. Available plans are Basic, Pro, Enterprise.
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
            Suggest Discount & Plan
          </Button>
        </form>
      </Form>

      {isPending && (
        <Card className="shadow-lg animate-pulse">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Generating Suggestion...</CardTitle>
            <CardDescription>Our AI is hard at work. This might take a moment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-6 bg-muted rounded w-1/3 mt-2"></div>
            <div className="h-16 bg-muted rounded"></div>
          </CardContent>
        </Card>
      )}

      {result && !isPending && (
        <Card className="shadow-xl border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-accent" />
              AI Discount & Plan Suggestion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suggested Discount</p>
                <p className="text-4xl font-bold text-primary">{result.discountPercentage}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recommended Plan</p>
                <p className="text-3xl font-bold text-primary flex items-center">
                  <Briefcase className="mr-2 h-7 w-7 text-primary/80" />
                  {result.recommendedPlan}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Reason</p>
              <p className="text-foreground">{result.reason}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

