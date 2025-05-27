
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, FileJson, Workflow, Zap } from "lucide-react";

const genkitFlows = [
  {
    name: "Suggest Discounts Flow",
    icon: Zap,
    description: "Suggests dynamic discounts and subscription plans based on user subscription level and usage history.",
    endpoint: "/api/genkit/flows/suggestDiscountsFlow",
    inputSchema: `{
  "subscriptionLevel": "string (e.g., Basic, Premium)",
  "usageHistory": "string (JSON format, e.g., { loginsLast30Days: 25, featuresUsed: [...] })"
}`,
    outputSchema: `{
  "discountPercentage": "number (0-100)",
  "recommendedPlan": "string (e.g., Basic, Pro, Enterprise)",
  "reason": "string (Explanation for the suggestion)"
}`
  },
  {
    name: "Summarize Text Flow",
    icon: Workflow,
    description: "Generates a concise summary of a given text.",
    endpoint: "/api/genkit/flows/summarizeTextFlow",
    inputSchema: `{
  "textToSummarize": "string (The text to be summarized, min 50 chars)"
}`,
    outputSchema: `{
  "summary": "string (The generated summary)"
}`
  },
  {
    name: "Suggest Invoice Item Flow",
    icon: FileJson,
    description: "Suggests invoice item details based on a service description.",
    endpoint: "/api/genkit/flows/suggestInvoiceItemFlow",
    inputSchema: `{
  "serviceDescription": "string (Description of the service/product, min 10 chars)"
}`,
    outputSchema: `{
  "suggestedItemName": "string",
  "suggestedItemDescription": "string",
  "suggestedUnitPrice": "number"
}`
  }
];

export default function ApiDocsPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl flex items-center justify-center">
          <Code className="mr-3 h-10 w-10 text-primary" />
          API Documentation
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome to the ClimaBill API documentation. Here you'll find information about our available Genkit flows.
          (This is a placeholder page with mock data).
        </p>
      </div>

      <div className="space-y-10">
        {genkitFlows.map((flow) => (
          <Card key={flow.name} className="shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/30 p-6">
              <CardTitle className="text-2xl text-primary flex items-center">
                <flow.icon className="mr-3 h-6 w-6" />
                {flow.name}
              </CardTitle>
              <CardDescription className="pt-1">
                {flow.description}
              </CardDescription>
              <p className="text-sm text-muted-foreground pt-2">
                <span className="font-semibold text-foreground/80">Conceptual Endpoint:</span> <code className="text-xs bg-secondary px-1 py-0.5 rounded">{flow.endpoint}</code>
              </p>
            </CardHeader>
            <CardContent className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Input Schema</h3>
                <pre className="p-4 bg-secondary rounded-md text-secondary-foreground text-xs overflow-x-auto">
                  <code>{flow.inputSchema}</code>
                </pre>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Output Schema</h3>
                <pre className="p-4 bg-secondary rounded-md text-secondary-foreground text-xs overflow-x-auto">
                  <code>{flow.outputSchema}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-muted-foreground">
          Note: Full API specifications, authentication details, and rate limits would be available in a production environment.
          These Genkit flows are typically invoked via server actions in the Next.js application.
        </p>
      </div>
    </div>
  );
}
