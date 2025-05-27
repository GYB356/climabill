
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle, Star, Sparkles, Leaf, LayoutDashboard, Package, Zap, Briefcase, CheckCircle, ChevronLeft, ChevronRight, CreditCard, Landmark, Ticket } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';


const tourSlides = [
  {
    title: "Welcome to ClimaBill!",
    description: "Discover how ClimaBill helps you manage billing efficiently while tracking your carbon footprint. This quick tour will guide you through the key features.",
    imageUrl: "https://placehold.co/1200x675.png",
    dataAiHint: "welcome screen app user interface"
  },
  {
    title: "AI-Powered Insights",
    description: "Leverage smart suggestions for invoice items, dynamic discounts based on usage, and concise text summarization, all powered by AI.",
    imageUrl: "https://placehold.co/1200x675.png",
    dataAiHint: "dashboard analytics AI"
  },
  {
    title: "Carbon Footprint Tracking",
    description: "Monitor your estimated carbon emissions, see your offset contributions, and manage your environmental impact directly within the platform.",
    imageUrl: "https://placehold.co/1200x675.png",
    dataAiHint: "carbon chart environment"
  },
  {
    title: "Seamless Billing Management",
    description: "Choose from modern invoice templates, set up automated reminders, and get a clear overview of your billing on the dashboard.",
    imageUrl: "https://placehold.co/1200x675.png",
    dataAiHint: "invoice template app"
  },
  {
    title: "Ready to Get Started?",
    description: "Sign up today to experience smarter, greener billing with ClimaBill. Explore the dashboard or configure your settings to begin.",
    imageUrl: "https://placehold.co/1200x675.png",
    dataAiHint: "call to action app"
  },
];

const pricingPlans = [
  { tier: 'Basic', price: '29', icon: Package, features: ['AI Invoice Item Suggester', 'Basic Carbon Tracking', '100 Invoices/mo'], dataAiHint: "basic plan" },
  { tier: 'Pro', price: '79', icon: Zap, features: ['Smart Discounts AI', 'Advanced Carbon Offsetting', '500 Invoices/mo', 'Priority Support', 'Optional "Green Tier" auto-donation'], highlighted: true, dataAiHint: "pro plan" },
  { tier: 'Enterprise', price: '199', icon: Briefcase, features: ['All Pro Features', 'Custom AI Models', 'Unlimited Invoices', 'Dedicated Account Manager', 'Includes "Green Tier" auto-donation'], dataAiHint: "enterprise plan" },
];

const paymentMethods = [
    { id: "cc", name: "Credit Card", icon: CreditCard },
    { id: "paypal", name: "PayPal", icon: Ticket }, // Changed Paypal to Ticket
    { id: "bank", name: "Bank Transfer", icon: Landmark },
];

export default function HomePage() {
  const [currentTourSlide, setCurrentTourSlide] = useState(0);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<(typeof pricingPlans)[0] | null>(null);
  const [enableCarbonOffsetCheckout, setEnableCarbonOffsetCheckout] = useState(true);
  const [carbonOffsetAmountCheckout, setCarbonOffsetAmountCheckout] = useState("5.00");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0].id);
  const [optForPaymentPlan, setOptForPaymentPlan] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const handleNextSlide = () => {
    setCurrentTourSlide((prev) => Math.min(prev + 1, tourSlides.length - 1));
  };

  const handlePrevSlide = () => {
    setCurrentTourSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleOpenCheckoutModal = (plan: (typeof pricingPlans)[0]) => {
    setSelectedPlan(plan);
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-background to-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            Smarter Billing, Greener Planet.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            ClimaBill combines AI-powered billing insights with actionable carbon footprint tracking to help your business thrive sustainably.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/signup">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/login">Login to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Why ClimaBill?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 border rounded-lg shadow-lg bg-card">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">AI-Powered Insights</h3>
              <p className="text-muted-foreground">Automate billing, get smart discount suggestions, and understand your revenue streams like never before.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-lg bg-card">
              <Leaf className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Climate Conscious</h3>
              <p className="text-muted-foreground">Track your carbon footprint, offer offset options, and build a more sustainable business.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-lg bg-card">
              <LayoutDashboard className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Seamless Workflow</h3>
              <p className="text-muted-foreground">Modern invoice templates, automated reminders, and an intuitive dashboard to manage it all.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tour */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">See ClimaBill in Action</h2>
          <Dialog onOpenChange={(open) => { if (!open) setCurrentTourSlide(0); }}> 
            <DialogTrigger asChild>
              <div className="aspect-video bg-muted rounded-lg shadow-xl max-w-3xl mx-auto flex items-center justify-center relative overflow-hidden cursor-pointer group">
                <Image
                  src={tourSlides[0].imageUrl}
                  alt="ClimaBill Demo Thumbnail"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  data-ai-hint={tourSlides[0].dataAiHint}
                  priority
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center flex-col group-hover:bg-black/40 transition-colors duration-300">
                  <PlayCircle className="w-20 h-20 text-white/80 group-hover:text-white transition-colors duration-300 mb-2 group-hover:scale-110 transform" />
                  <p className="mt-2 text-white/90 text-lg font-semibold">Take Product Tour</p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] p-0">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-2xl">{tourSlides[currentTourSlide].title}</DialogTitle>
                <DialogDescription>
                  {tourSlides[currentTourSlide].description}
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 pt-2 aspect-video bg-black flex items-center justify-center">
                <Image
                  src={tourSlides[currentTourSlide].imageUrl}
                  alt={tourSlides[currentTourSlide].title}
                  width={1200}
                  height={675}
                  className="rounded-md object-contain max-h-full"
                  data-ai-hint={tourSlides[currentTourSlide].dataAiHint}
                />
              </div>
              <DialogFooter className="p-6 pt-2 flex justify-between items-center">
                <Button variant="outline" onClick={handlePrevSlide} disabled={currentTourSlide === 0}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <span className="text-sm text-muted-foreground">Slide {currentTourSlide + 1} of {tourSlides.length}</span>
                {currentTourSlide < tourSlides.length - 1 ? (
                  <Button onClick={handleNextSlide}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <DialogClose asChild>
                    <Button>Finish Tour</Button>
                  </DialogClose>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Loved by Businesses Like Yours</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Alex P. - SaaS Founder", quote: "ClimaBill revolutionized how we handle subscriptions and helped us highlight our eco-commitment! The AI suggestions save us hours.", dataAiHint: "person office" },
              { name: "Sarah L. - Freelance Designer", quote: "The AI invoice item suggester is a lifesaver, and my clients love the clean, modern templates. Plus, the carbon tracking is a great touch.", dataAiHint: "designer workspace" },
              { name: "EcoHarvest Ltd. - Sustainability Lead", quote: "Finally, a billing platform that aligns with our sustainable values. The carbon footprint tracking and offset options are fantastic for our reporting.", dataAiHint: "nature meeting" },
            ].map((testimonial, index) => (
              <div key={index} className="p-6 bg-card border rounded-lg shadow-lg flex flex-col">
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-accent fill-accent" />)}
                </div>
                <p className="text-muted-foreground mb-4 italic flex-grow">"{testimonial.quote}"</p>
                <p className="font-semibold text-card-foreground text-right mt-auto">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section Placeholder */}
      <section id="pricing" className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-12">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map(plan => (
              <div key={plan.tier} className={`p-8 bg-card border rounded-lg shadow-lg flex flex-col ${plan.highlighted ? 'border-primary ring-2 ring-primary' : 'border-border'}`}>
                <plan.icon className={`w-12 h-12 mx-auto mb-4 ${plan.highlighted ? 'text-primary' : 'text-accent'}`} />
                <h3 className="text-2xl font-semibold mb-2 text-foreground">{plan.tier}</h3>
                <p className="text-4xl font-bold text-foreground mb-2">${plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                <ul className="text-muted-foreground space-y-2 my-6 text-sm text-left flex-grow">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-primary/80 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button size="lg" variant={plan.highlighted ? 'default' : 'outline'} className="w-full mt-auto" onClick={() => handleOpenCheckoutModal(plan)}>
                  Get Started
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-muted-foreground">Need something different? <Link href="/#contact" className="text-primary underline hover:text-primary/80">Contact us</Link> for custom plans.</p>
        </div>
      </section>

      {selectedPlan && (
        <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl">Checkout Summary</DialogTitle>
              <DialogDescription>
                You're subscribing to the <span className="font-semibold text-primary">{selectedPlan.tier}</span> plan.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-semibold text-foreground">{selectedPlan.tier}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-semibold text-foreground">${selectedPlan.price}/month</span>
              </div>

              <Separator className="my-4" />

              <div>
                <Label className="text-base font-medium mb-2 block">Payment Method</Label>
                <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <Label
                      key={method.id}
                      htmlFor={`payment-${method.id}`}
                      className={`flex flex-col items-center justify-center rounded-md border-2 p-3 hover:bg-accent/10 cursor-pointer
                                  ${selectedPaymentMethod === method.id ? "border-primary bg-accent/5" : "border-muted"}`}
                    >
                      <RadioGroupItem value={method.id} id={`payment-${method.id}`} className="sr-only" />
                      <method.icon className={`h-7 w-7 mb-1 ${selectedPaymentMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-xs font-medium ${selectedPaymentMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`}>{method.name}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <Separator className="my-4" />

              <div className="border-t pt-4 mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="carbon-offset-checkout" className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-accent" />
                    Add Carbon Offset
                  </Label>
                  <Switch
                    id="carbon-offset-checkout"
                    checked={enableCarbonOffsetCheckout}
                    onCheckedChange={setEnableCarbonOffsetCheckout}
                  />
                </div>
                {enableCarbonOffsetCheckout && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="carbon-offset-amount-checkout" className="text-sm text-muted-foreground whitespace-nowrap">Offset Amount:</Label>
                    <Input
                      id="carbon-offset-amount-checkout"
                      type="number"
                      value={carbonOffsetAmountCheckout}
                      onChange={(e) => setCarbonOffsetAmountCheckout(e.target.value)}
                      className="h-8"
                      placeholder="5.00"
                    />
                     <span className="text-sm text-muted-foreground">USD</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="payment-plan-opt-in" checked={optForPaymentPlan} onCheckedChange={(checked) => setOptForPaymentPlan(checked as boolean)} />
                <Label htmlFor="payment-plan-opt-in" className="text-sm font-normal cursor-pointer">
                  Request 3-month payment plan (if eligible, subject to approval)
                </Label>
              </div>


              <Separator className="my-4" />

              <div className="border-t pt-4 mt-4 flex justify-between items-baseline">
                <span className="text-lg font-semibold text-foreground">Total Due Today:</span>
                <span className="text-2xl font-bold text-primary">
                  ${(parseFloat(selectedPlan.price) + (enableCarbonOffsetCheckout ? parseFloat(carbonOffsetAmountCheckout) || 0 : 0)).toFixed(2)}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCheckoutModalOpen(false)}>Cancel</Button>
              <Button type="button" onClick={() => { alert('Proceeding to payment... (Placeholder)'); setIsCheckoutModalOpen(false); }}>
                <CreditCard className="mr-2 h-4 w-4" /> Proceed to Payment (Placeholder)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Contact Section Placeholder */}
      <section id="contact" className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Get in Touch</h2>
          <p className="text-muted-foreground mb-8">
            Have questions or need a custom solution? We're here to help.
          </p>
          <form className="space-y-6" onSubmit={(e) => {e.preventDefault(); alert('Message sent! (Placeholder)'); (e.target as HTMLFormElement).reset();}}>
            <Input type="text" placeholder="Your Name" className="bg-card" required />
            <Input type="email" placeholder="Your Email" className="bg-card" required />
            <Textarea placeholder="Your Message" className="bg-card min-h-[120px]" required />
            <Button size="lg" type="submit">Send Message</Button>
          </form>
        </div>
      </section>

      {/* Privacy Policy Placeholder Section */}
      <section id="privacy" className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-4">Privacy Policy</h2>
          <p className="text-muted-foreground mb-2">Last updated: {currentDate}</p>
          <p className="text-muted-foreground">This is a placeholder for ClimaBill's privacy policy. In a real application, this section would detail how user data is collected, used, stored, and protected, in compliance with regulations like GDPR and CCPA. It would cover aspects such as data minimization, user consent, data subject rights (access, rectification, erasure), data security measures, cookie usage, and information about third-party data processors. Users would be informed about their rights and how to exercise them.</p>
        </div>
      </section>

      {/* Terms of Service Placeholder Section */}
      <section id="terms" className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-4">Terms of Service</h2>
          <p className="text-muted-foreground mb-2">Effective date: {currentDate}</p>
          <p className="text-muted-foreground">This is a placeholder for ClimaBill's terms of service. A comprehensive ToS would outline the agreement between ClimaBill and its users. It would cover user responsibilities, acceptable use policies, payment terms, subscription details, limitations of liability, intellectual property rights, dispute resolution mechanisms, and conditions for account termination. This document is crucial for setting expectations and legal boundaries for the use of the ClimaBill platform.</p>
        </div>
      </section>

    </div>
  );
}
