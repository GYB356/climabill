
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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, Sparkles, ReceiptText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SuggestInvoiceItemInput, SuggestInvoiceItemOutput } from "@/ai/flows/suggest-invoice-item-flow";
import { suggestInvoiceItem } from "@/ai/flows/suggest-invoice-item-flow"; // Server Action

const formSchema = z.object({
  serviceDescription: z.string().min(10, {
    message: "Service description must be at least 10 characters.",
  }).max(500, {
    message: "Service description must not exceed 500 characters."
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function InvoiceItemSuggesterPage() {
  const [isPending, startTransition] = useTransition();
  const [suggestionResult, setSuggestionResult] = useState<SuggestInvoiceItemOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceDescription: "",
    },
  });

  function onSubmit(values: FormValues) {
    setSuggestionResult(null);
    startTransition(async () => {
      try {
        const result = await suggestInvoiceItem(values as SuggestInvoiceItemInput);
        setSuggestionResult(result);
        toast({
          title: "Invoice Item Suggested!",
          description: "AI has generated a suggestion for your invoice item.",
        });
      } catch (error) {
        console.error("Error suggesting invoice item:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to suggest invoice item. Please try again.",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <ReceiptText className="mr-3 h-8 w-8 text-primary" />
          AI Invoice Item Suggester
        </h1>
        <p className="text-muted-foreground">
          Describe a service or product, and let AI help you craft the perfect invoice line item.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Service/Product Description</CardTitle>
              <CardDescription>Enter details about the item you want to bill for.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="serviceDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="serviceDescriptionInput" className="sr-only">Service/Product Description</FormLabel>
                    <FormControl>
                      <Textarea
                        id="serviceDescriptionInput"
                        placeholder="E.g., 'Hourly consulting services for web development project' or 'Premium coffee beans, 1kg bag'"
                        className="min-h-[150px] text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The AI will use this description to suggest an item name, detailed description, and unit price.
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
              <Lightbulb className="mr-2 h-5 w-5" />
            )}
            Get AI Suggestion
          </Button>
        </form>
      </Form>

      {isPending && (
        <Card className="shadow-lg animate-pulse">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Generating Suggestion...</CardTitle>
            <CardDescription>Our AI is processing your description. This might take a moment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-6 bg-muted rounded w-1/4 mt-2"></div>
          </CardContent>
        </Card>
      )}

      {suggestionResult && !isPending && (
        <Card className="shadow-xl border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-accent" />
              AI Generated Suggestion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="suggestedItemName" className="text-sm font-medium text-muted-foreground">Suggested Item Name</Label>
              <Input id="suggestedItemName" value={suggestionResult.suggestedItemName} readOnly className="mt-1 bg-background/70 cursor-default" />
            </div>
            <div>
              <Label htmlFor="suggestedItemDescription" className="text-sm font-medium text-muted-foreground">Suggested Item Description</Label>
              <Textarea id="suggestedItemDescription" value={suggestionResult.suggestedItemDescription} readOnly className="mt-1 min-h-[80px] bg-background/70 cursor-default" />
            </div>
            <div>
              <Label htmlFor="suggestedUnitPrice" className="text-sm font-medium text-muted-foreground">Suggested Unit Price (USD)</Label>
              <Input id="suggestedUnitPrice" type="number" value={suggestionResult.suggestedUnitPrice} readOnly className="mt-1 bg-background/70 cursor-default" />
            </div>
            <p className="text-xs text-muted-foreground pt-2">This suggestion was generated by AI. You can copy and paste these details into your invoices.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
