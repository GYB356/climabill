"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

const templates = [
  { id: "modern", name: "Modern Minimalist", description: "Clean lines, focuses on readability.", imageUrl: "https://placehold.co/400x560.png", dataAiHint: "invoice minimalist" },
  { id: "classic", name: "Classic Professional", description: "Traditional layout, formal and detailed.", imageUrl: "https://placehold.co/400x560.png", dataAiHint: "invoice classic" },
  { id: "bold", name: "Bold & Vibrant", description: "Uses color accents, contemporary feel.", imageUrl: "https://placehold.co/400x560.png", dataAiHint: "invoice colorful" },
  { id: "eco", name: "Eco Friendly", description: "Subtle green accents, emphasizes sustainability.", imageUrl: "https://placehold.co/400x560.png", dataAiHint: "invoice green" },
];

export default function InvoiceTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Invoice Templates</h1>
          <p className="text-muted-foreground">Choose a template that best represents your brand.</p>
        </div>
        <Button size="lg">
          <CheckCircle className="mr-2 h-5 w-5" />
          Save Selection
        </Button>
      </div>

      <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => (
          <Label
            key={template.id}
            htmlFor={template.id}
            className={`rounded-lg border-2 bg-card text-card-foreground shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer 
                        ${selectedTemplate === template.id ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"}`}
          >
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <RadioGroupItem value={template.id} id={template.id} className="sr-only" />
                {selectedTemplate === template.id && <CheckCircle className="h-6 w-6 text-primary" />}
              </div>
              <CardDescription className="text-xs h-10 line-clamp-2">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-[4/5.6] relative overflow-hidden rounded-b-md">
                <Image
                  src={template.imageUrl}
                  alt={template.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  data-ai-hint={template.dataAiHint}
                />
              </div>
            </CardContent>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
