
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Cloud, ExternalLink, Lightbulb, Recycle, Trees } from "lucide-react";
import Image from "next/image";

const sustainabilityTips = [
  {
    title: "Optimize Cloud Usage",
    icon: Cloud,
    content: "Regularly review your cloud resource allocation. Shut down unused instances, right-size virtual machines, and leverage auto-scaling to match demand. Consider choosing data centers powered by renewable energy if your provider offers this option.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "cloud server"
  },
  {
    title: "Promote Energy Efficiency in Operations",
    icon: Lightbulb,
    content: "Encourage energy-saving practices in your workplace, such as using energy-efficient lighting and equipment, and powering down devices when not in use. For remote teams, share tips on efficient home office setups.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "lightbulb idea"
  },
  {
    title: "Reduce Waste and Promote Recycling",
    icon: Recycle,
    content: "Implement a comprehensive recycling program. Minimize paper usage by opting for digital communication and document management. Responsibly dispose of electronic waste.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "recycling bins"
  },
  {
    title: "Support Reforestation & Carbon Offset Projects",
    icon: Trees,
    content: "Beyond offsetting your direct emissions, consider supporting verified carbon offset projects or reforestation initiatives. ClimaBill helps you find and contribute to such projects.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "forest trees"
  },
];

const externalResources = [
  { name: "EPA: Reducing Your Carbon Footprint at Work", url: "https://www.epa.gov/climatechange-search?search_api_views_fulltext=reduce+carbon+footprint+at+work" },
  { name: "Project Drawdown: Climate Solutions", url: "https://drawdown.org/solutions" },
  { name: "SBA: Green Business Guide", url: "https://www.sba.gov/business-guide/manage-your-business/go-green" },
];

export default function LearnSustainabilityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Trees className="mr-3 h-8 w-8 text-primary" />
          Learn About Sustainability
        </h1>
        <p className="text-muted-foreground">
          Discover tips and resources to reduce your carbon footprint and promote sustainable practices.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Actionable Tips for Your Business</CardTitle>
          <CardDescription>Practical steps you can take to make your operations more sustainable.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {sustainabilityTips.map((tip, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-base hover:no-underline">
                  <div className="flex items-center gap-3">
                    <tip.icon className="h-5 w-5 text-primary" />
                    {tip.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pt-2 text-muted-foreground">
                  <div className="grid md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-2">
                      <p>{tip.content}</p>
                    </div>
                    <div className="relative aspect-video md:col-span-1 rounded-md overflow-hidden">
                        <Image 
                            src={tip.image} 
                            alt={tip.title} 
                            fill 
                            sizes="(max-width: 768px) 100vw, 33vw" 
                            className="object-cover"
                            data-ai-hint={tip.dataAiHint} 
                        />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Further Reading & Resources</CardTitle>
          <CardDescription>Explore these external resources for more in-depth information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {externalResources.map((resource) => (
            <a
              key={resource.name}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent group-hover:text-primary" />
                <span className="text-foreground group-hover:text-primary">{resource.name}</span>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </a>
          ))}
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground text-sm pt-4">
          <p>ClimaBill is committed to helping businesses operate more sustainably. <br/> Explore our platform features to track and reduce your environmental impact.</p>
      </div>
    </div>
  );
}

    