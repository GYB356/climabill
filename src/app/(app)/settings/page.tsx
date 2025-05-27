
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, BellRing, Leaf, ShieldCheck, Sparkles, DatabaseZap, Trash2, CreditCard, Edit3, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const reminderOptions = [
  { id: "7days", label: "7 days before deadline" },
  { id: "3days", label: "3 days before deadline" },
  { id: "1day", label: "1 day before deadline" },
  { id: "onDeadline", label: "On the deadline" },
];

// Mock current subscription
const currentSubscription = {
  planName: "Pro Plan",
  price: 79,
  billingCycle: "monthly",
  nextBillingDate: new Date(new Date().setDate(new Date().getDate() + 20)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'}),
  features: [
    "Smart Discounts AI",
    "Advanced Carbon Offsetting",
    "500 Invoices/mo",
    "Priority Support",
    "Optional \"Green Tier\" auto-donation"
  ]
};


export default function SettingsPage() {
  const [paymentDeadlineDays, setPaymentDeadlineDays] = useState<string>("30");
  const [selectedReminders, setSelectedReminders] = useState<string[]>(["3days", "1day"]);
  const [enableCarbonOffset, setEnableCarbonOffset] = useState(true);
  const [carbonOffsetAmount, setCarbonOffsetAmount] = useState("5.00");
  const [enableGreenTier, setEnableGreenTier] = useState(false);
  const [enableMFA, setEnableMFA] = useState(false);
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);


  const handleReminderChange = (reminderId: string) => {
    setSelectedReminders(prev =>
      prev.includes(reminderId)
        ? prev.filter(id => id !== reminderId)
        : [...prev, reminderId]
    );
  };

  const handleSaveChanges = () => {
    console.log({
      paymentDeadlineDays,
      selectedReminders,
      enableCarbonOffset,
      carbonOffsetAmount,
      enableGreenTier,
      enableMFA,
    });
    toast({
      title: "Settings Saved!",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleDataExport = () => {
    toast({
      title: "Data Export Requested",
      description: "Your data export request has been received. This is a placeholder action.",
    });
  };

  const handleAccountDeletion = () => {
    toast({
      title: "Account Deletion Requested",
      description: "Your account deletion request has been received. This is a placeholder action.",
      variant: "destructive",
    });
  };

  const handleChangePlan = () => {
     toast({
      title: "Change Plan Clicked",
      description: "Redirecting to pricing page (placeholder action).",
    });
    // In a real app, you might redirect to /#pricing or a dedicated upgrade page
  };

  const handleCancelSubscription = () => {
     toast({
      title: "Cancel Subscription Requested",
      description: "Subscription cancellation process initiated (placeholder action).",
      variant: "destructive"
    });
  };


  if (!isMounted) {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-8 w-48 mb-2 rounded-md" />
                <Skeleton className="h-4 w-72 rounded-md" />
            </div>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-foreground flex items-center">
                        <Skeleton className="mr-2 h-5 w-5 rounded-full" />
                        <Skeleton className="h-6 w-3/4 rounded-md" />
                    </CardTitle>
                    <Skeleton className="h-4 w-full rounded-md" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Skeleton className="h-5 w-1/2 mb-1 rounded-md" /> {/* Plan Name */}
                        <Skeleton className="h-4 w-1/3 mb-2 rounded-md" /> {/* Price */}
                        <Skeleton className="h-3 w-2/3 mb-3 rounded-md" /> {/* Next Billing */}
                        <div className="space-y-2">
                           {[...Array(3)].map(i => <Skeleton key={i} className="h-3 w-full rounded-md bg-muted" />)}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Skeleton className="h-9 w-1/2 rounded-md bg-muted" />
                            <Skeleton className="h-9 w-1/2 rounded-md bg-muted" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-foreground flex items-center">
                        <Skeleton className="mr-2 h-5 w-5 rounded-full" />
                        <Skeleton className="h-6 w-3/4 rounded-md" />
                    </CardTitle>
                    <Skeleton className="h-4 w-full rounded-md" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Skeleton className="h-5 w-1/3 mb-2 rounded-md" />
                        <Skeleton className="h-4 w-full md:w-[280px] mb-1 rounded-md" />
                        <Skeleton className="h-10 w-full md:w-[280px] rounded-md" />
                    </div>
                    <div>
                        <Skeleton className="h-5 w-1/3 mb-2 rounded-md" />
                        <Skeleton className="h-4 w-full md:w-[280px] mb-1 rounded-md" />
                        <div className="space-y-3 rounded-md border p-4 bg-muted/10">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-3">
                                    <Skeleton className="h-4 w-4 rounded-sm bg-muted" />
                                    <Skeleton className="h-4 flex-1 rounded-md bg-muted" />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-foreground flex items-center">
                        <Skeleton className="mr-2 h-5 w-5 rounded-full" />
                        <Skeleton className="h-6 w-3/4 rounded-md" />
                    </CardTitle>
                    <Skeleton className="h-4 w-full rounded-md" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-3 rounded-md border p-4 bg-muted/10">
                        <div className="space-y-1.5 flex-1">
                            <Skeleton className="h-5 w-2/3 rounded-md bg-muted" />
                            <Skeleton className="h-3 w-full rounded-md bg-muted" />
                        </div>
                        <Skeleton className="h-6 w-11 rounded-full bg-muted" />
                    </div>
                    {enableCarbonOffset && (
                        <div className="space-y-2 pl-4 border-l-2 border-accent ml-1">
                           <Skeleton className="h-5 w-1/3 mb-1 rounded-md bg-muted" />
                           <Skeleton className="h-10 w-full md:w-[280px] rounded-md bg-muted" />
                           <Skeleton className="h-3 w-3/4 rounded-md bg-muted" />
                        </div>
                    )}
                    <div className="flex items-center justify-between space-x-3 rounded-md border p-4 bg-muted/10 mt-4">
                        <div className="space-y-1.5 flex-1">
                            <Skeleton className="h-5 w-2/3 rounded-md bg-muted" />
                            <Skeleton className="h-3 w-full rounded-md bg-muted" />
                        </div>
                        <Skeleton className="h-6 w-11 rounded-full bg-muted" />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-foreground flex items-center">
                        <Skeleton className="mr-2 h-5 w-5 rounded-full" />
                        <Skeleton className="h-6 w-3/4 rounded-md" />
                    </CardTitle>
                    <Skeleton className="h-4 w-full rounded-md" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-3 rounded-md border p-4 bg-muted/10">
                        <div className="space-y-1.5 flex-1">
                            <Skeleton className="h-5 w-2/3 rounded-md bg-muted" />
                            <Skeleton className="h-3 w-full rounded-md bg-muted" />
                        </div>
                        <Skeleton className="h-6 w-11 rounded-full bg-muted" />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-foreground flex items-center">
                        <Skeleton className="mr-2 h-5 w-5 rounded-full" />
                        <Skeleton className="h-6 w-3/4 rounded-md" />
                    </CardTitle>
                    <Skeleton className="h-4 w-full rounded-md" />
                </CardHeader>
                <CardContent className="space-y-4">
                     <Skeleton className="h-10 w-full md:w-1/2 rounded-md bg-muted" />
                     <Skeleton className="h-10 w-full md:w-1/2 rounded-md bg-muted" />
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Skeleton className="h-11 w-44 rounded-md bg-primary" />
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your billing, subscription, and platform preferences.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-primary" />
            Subscription Management
          </CardTitle>
          <CardDescription>View your current plan and manage your subscription.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{currentSubscription.planName}</h3>
            <p className="text-muted-foreground">${currentSubscription.price} / {currentSubscription.billingCycle}</p>
            <p className="text-sm text-muted-foreground">Next billing date: {currentSubscription.nextBillingDate}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Included features:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {currentSubscription.features.map(feature => <li key={feature}>{feature}</li>)}
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={handleChangePlan}>
                <Edit3 className="mr-2 h-4 w-4"/> Change Plan
            </Button>
            <Button variant="destructive" className="w-full sm:w-auto" onClick={handleCancelSubscription}>
                <XCircle className="mr-2 h-4 w-4"/> Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>


      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center">
            <BellRing className="mr-2 h-5 w-5 text-primary" />
            Automated Payment Reminders
          </CardTitle>
          <CardDescription>Configure when to send payment reminders to your clients.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="payment-deadline-days" className="text-base font-medium">Default Payment Deadline (Days)</Label>
            <p className="text-sm text-muted-foreground mb-2">Set the default number of days until an invoice is due.</p>
            <Input
              id="payment-deadline-days"
              type="number"
              value={paymentDeadlineDays}
              onChange={(e) => setPaymentDeadlineDays(e.target.value)}
              placeholder="e.g., 30"
              className="w-full md:w-[280px]"
            />
          </div>

          <div>
            <Label className="text-base font-medium">Reminder Schedule</Label>
            <p className="text-sm text-muted-foreground mb-2">Select when automated reminders should be sent.</p>
            <div className="space-y-3 rounded-md border p-4 bg-background">
              {reminderOptions.map(option => (
                <div key={option.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={option.id}
                    checked={selectedReminders.includes(option.id)}
                    onCheckedChange={() => handleReminderChange(option.id)}
                  />
                  <Label htmlFor={option.id} className="font-normal cursor-pointer text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center">
            <Leaf className="mr-2 h-5 w-5 text-accent" />
            Eco Contributions
          </CardTitle>
          <CardDescription>Opt-in to offset carbon emissions and support sustainability.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-3 rounded-md border p-4 bg-background">
            <div className="space-y-0.5">
              <Label htmlFor="carbon-offset-toggle" className="text-base font-medium">
                Enable Carbon Offset Fee
              </Label>
              <p className="text-sm text-muted-foreground">
                Add a small fee to subscriptions to contribute to carbon offset projects.
              </p>
            </div>
            <Switch
              id="carbon-offset-toggle"
              checked={enableCarbonOffset}
              onCheckedChange={setEnableCarbonOffset}
            />
          </div>

          {enableCarbonOffset && (
            <div className="space-y-2 pl-4 border-l-2 border-accent ml-1">
              <Label htmlFor="carbon-offset-amount" className="text-base font-medium">Offset Amount (USD)</Label>
              <Input
                id="carbon-offset-amount"
                type="number"
                value={carbonOffsetAmount}
                onChange={(e) => setCarbonOffsetAmount(e.target.value)}
                placeholder="e.g., 5.00"
                className="w-full md:w-[280px]"
              />
              <p className="text-xs text-muted-foreground">
                This flat fee will be suggested to users during checkout.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between space-x-3 rounded-md border p-4 bg-background mt-4">
            <div className="space-y-0.5">
              <Label htmlFor="green-tier-toggle" className="text-base font-medium flex items-center">
                 <Sparkles className="mr-2 h-4 w-4 text-primary" /> Enable 'Green Tier' Auto-Donation
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically contribute a small portion of your subscription to certified sustainability projects.
              </p>
            </div>
            <Switch
              id="green-tier-toggle"
              checked={enableGreenTier}
              onCheckedChange={setEnableGreenTier}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
            Security Settings
          </CardTitle>
          <CardDescription>Manage your account security preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-3 rounded-md border p-4 bg-background">
            <div className="space-y-0.5">
              <Label htmlFor="mfa-toggle" className="text-base font-medium">
                Enable Multi-Factor Authentication (MFA)
              </Label>
              <p className="text-sm text-muted-foreground">
                Enhance your account security by requiring a second form of verification.
              </p>
            </div>
            <Switch
              id="mfa-toggle"
              checked={enableMFA}
              onCheckedChange={setEnableMFA}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center">
            <DatabaseZap className="mr-2 h-5 w-5 text-primary" />
            Data Management
          </CardTitle>
          <CardDescription>Manage your account data and export options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full md:w-auto" onClick={handleDataExport}>
            <DatabaseZap className="mr-2 h-4 w-4" /> Request Data Export
          </Button>
          <Button variant="destructive" className="w-full md:w-auto" onClick={handleAccountDeletion}>
            <Trash2 className="mr-2 h-4 w-4" /> Request Account Deletion
          </Button>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSaveChanges}>
          <Save className="mr-2 h-5 w-5" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
