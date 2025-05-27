"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; // Added for Avatar
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, BellRing, Leaf, ShieldCheck, Sparkles, DatabaseZap, Trash2, CreditCard, Edit3, XCircle, Globe, Users, Link2, PlusCircle, Settings2, Palette, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


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

const mockTeamMembers = [
  { id: "user1", name: "Alice Wonderland", email: "alice@example.com", role: "Admin", avatar: "https://placehold.co/40x40.png", dataAiHint: "woman smiling" },
  { id: "user2", name: "Bob The Builder", email: "bob@example.com", role: "Editor", avatar: "https://placehold.co/40x40.png", dataAiHint: "man glasses"  },
  { id: "user3", name: "Charlie Brown", email: "charlie@example.com", role: "Viewer", avatar: "https://placehold.co/40x40.png", dataAiHint: "person neutral"  },
];

const mockIntegrations = [
  { id: "qbo", name: "QuickBooks Online", logo: "https://placehold.co/32x32.png", dataAiHint: "accounting software", connected: true, description: "Sync invoices and payments." },
  { id: "xero", name: "Xero", logo: "https://placehold.co/32x32.png", dataAiHint: "finance app", connected: false, description: "Automate financial reporting." },
  { id: "slack", name: "Slack", logo: "https://placehold.co/32x32.png", dataAiHint: "communication tool", connected: true, description: "Get billing notifications." },
];


export default function SettingsPage() {
  const [paymentDeadlineDays, setPaymentDeadlineDays] = useState<string>("30");
  const [selectedReminders, setSelectedReminders] = useState<string[]>(["3days", "1day"]);
  const [enableCarbonOffset, setEnableCarbonOffset] = useState(true);
  const [carbonOffsetAmount, setCarbonOffsetAmount] = useState("5.00");
  const [enableGreenTier, setEnableGreenTier] = useState(false);
  const [enableMFA, setEnableMFA] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [brandColor, setBrandColor] = useState("#306754"); // Default to primary theme color
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setLogoPreview(URL.createObjectURL(file));
      toast({ title: "Logo Uploaded (Preview)", description: `${file.name} selected. Actual upload requires backend.`});
    }
  };

  const handleSaveChanges = () => {
    console.log({
      paymentDeadlineDays,
      selectedReminders,
      enableCarbonOffset,
      carbonOffsetAmount,
      enableGreenTier,
      enableMFA,
      defaultCurrency,
      preferredLanguage,
      brandColor,
      logoUploaded: !!logoPreview,
    });
    toast({
      title: "Settings Saved!",
      description: "Your preferences have been updated successfully (simulated).",
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
  };

  const handleCancelSubscription = () => {
     toast({
      title: "Cancel Subscription Requested",
      description: "Subscription cancellation process initiated (placeholder action).",
      variant: "destructive"
    });
  };

  const handleInviteUser = () => {
    toast({
      title: "Invite User Clicked",
      description: "User invitation functionality is a placeholder.",
    });
  };
  
  const handleIntegrationConnect = (integrationName: string, isConnected: boolean) => {
     toast({
      title: `${isConnected ? 'Disconnecting' : 'Connecting'} ${integrationName}`,
      description: `This is a placeholder action for ${integrationName}.`,
    });
  };


  if (!isMounted) {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-8 w-48 mb-2 rounded-md" />
                <Skeleton className="h-4 w-72 rounded-md" />
            </div>

            {/* Subscription Management Skeleton */}
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
                        <Skeleton className="h-5 w-1/2 mb-1 rounded-md" />
                        <Skeleton className="h-4 w-1/3 mb-2 rounded-md" />
                        <Skeleton className="h-3 w-2/3 mb-3 rounded-md" />
                        <div className="space-y-2">
                           {[...Array(3)].map((_,i) => <Skeleton key={i} className="h-3 w-full rounded-md bg-muted" />)}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Skeleton className="h-9 w-1/2 rounded-md bg-muted" />
                            <Skeleton className="h-9 w-1/2 rounded-md bg-muted" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Reminders Skeleton */}
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

            {/* Eco Contributions Skeleton */}
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
                     <div className="space-y-2 pl-4 border-l-2 border-accent ml-1">
                           <Skeleton className="h-5 w-1/3 mb-1 rounded-md bg-muted" />
                           <Skeleton className="h-10 w-full md:w-[280px] rounded-md bg-muted" />
                           <Skeleton className="h-3 w-3/4 rounded-md bg-muted" />
                    </div>
                    <div className="flex items-center justify-between space-x-3 rounded-md border p-4 bg-muted/10 mt-4">
                        <div className="space-y-1.5 flex-1">
                            <Skeleton className="h-5 w-2/3 rounded-md bg-muted" />
                            <Skeleton className="h-3 w-full rounded-md bg-muted" />
                        </div>
                        <Skeleton className="h-6 w-11 rounded-full bg-muted" />
                    </div>
                </CardContent>
            </Card>

            {/* Branding Customization Skeleton */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-foreground flex items-center">
                        <Skeleton className="mr-2 h-5 w-5 rounded-full" />
                        <Skeleton className="h-6 w-3/4 rounded-md" />
                    </CardTitle>
                    <Skeleton className="h-4 w-full rounded-md" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-1/4 mb-1 rounded-md" />
                        <Skeleton className="h-10 w-full md:w-1/2 rounded-md" />
                        <Skeleton className="h-3 w-3/4 rounded-md" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-5 w-1/3 mb-1 rounded-md" />
                        <Skeleton className="h-10 w-16 rounded-md" />
                        <Skeleton className="h-3 w-1/2 rounded-md" />
                    </div>
                </CardContent>
            </Card>

            {/* Team Management Skeleton */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-foreground flex items-center">
                        <Skeleton className="mr-2 h-5 w-5 rounded-full" />
                        <Skeleton className="h-6 w-3/4 rounded-md" />
                    </CardTitle>
                    <Skeleton className="h-4 w-full rounded-md" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full md:w-1/3 rounded-md self-end" />
                    <div className="rounded-md border">
                        <Skeleton className="h-12 w-full rounded-t-md" /> {/* Table Header */}
                        {[1,2,3].map(i => (
                            <div key={i} className="flex items-center p-3 border-t">
                                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-4 w-3/5 rounded-md" />
                                    <Skeleton className="h-3 w-4/5 rounded-md" />
                                </div>
                                <Skeleton className="h-4 w-1/5 rounded-md" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            
            {/* Integrations Skeleton */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-foreground flex items-center">
                        <Skeleton className="mr-2 h-5 w-5 rounded-full" />
                        <Skeleton className="h-6 w-3/4 rounded-md" />
                    </CardTitle>
                    <Skeleton className="h-4 w-full rounded-md" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-md" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-32 rounded-md" />
                                    <Skeleton className="h-3 w-24 rounded-md" />
                                </div>
                            </div>
                            <Skeleton className="h-9 w-24 rounded-md" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Security Settings Skeleton */}
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

            {/* Localization Skeleton */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-foreground flex items-center">
                        <Skeleton className="mr-2 h-5 w-5 rounded-full" />
                        <Skeleton className="h-6 w-3/4 rounded-md" />
                    </CardTitle>
                    <Skeleton className="h-4 w-full rounded-md" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Skeleton className="h-5 w-1/3 mb-2 rounded-md" />
                        <Skeleton className="h-10 w-full md:w-[280px] rounded-md" />
                    </div>
                     <div>
                        <Skeleton className="h-5 w-1/3 mb-2 rounded-md" />
                        <Skeleton className="h-10 w-full md:w-[280px] rounded-md" />
                    </div>
                </CardContent>
            </Card>

            {/* Data Management Skeleton */}
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
            <Palette className="mr-2 h-5 w-5 text-primary" />
            Branding Customization
          </CardTitle>
          <CardDescription>Customize the look and feel of your billing portal and invoices.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="logo-upload" className="text-base font-medium">Upload Your Logo</Label>
            <p className="text-sm text-muted-foreground mb-2">Recommended format: PNG or SVG, max 2MB.</p>
            <Input id="logo-upload" type="file" accept="image/png, image/svg+xml" onChange={handleLogoUpload} className="w-full md:w-1/2" />
            {logoPreview && (
              <div className="mt-3 p-2 border rounded-md inline-block bg-muted">
                <Image src={logoPreview} alt="Logo preview" width={100} height={40} className="max-h-10 object-contain" />
              </div>
            )}
          </div>
           <div>
            <Label htmlFor="brand-color" className="text-base font-medium">Primary Brand Color</Label>
             <p className="text-sm text-muted-foreground mb-2">This color will be used for accents and highlights.</p>
            <Input 
              id="brand-color" 
              type="color" 
              value={brandColor} 
              onChange={(e) => setBrandColor(e.target.value)} 
              className="w-16 h-10 p-1"
            />
          </div>
        </CardContent>
      </Card>


       <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl text-foreground flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Team Management
            </CardTitle>
            <CardDescription>Manage team members and their access permissions.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleInviteUser}>
            <PlusCircle className="mr-2 h-4 w-4"/> Invite User
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTeamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                      <AvatarFallback>{member.name.substring(0,1)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                     <Select defaultValue={member.role}>
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Editor">Editor</SelectItem>
                            <SelectItem value="Viewer">Viewer</SelectItem>
                        </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => toast({title: `Editing ${member.name}`, description: "Placeholder action."})}>
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center">
                <Link2 className="mr-2 h-5 w-5 text-primary" />
                Integrations
            </CardTitle>
            <CardDescription>Connect ClimaBill with your other favorite tools.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {mockIntegrations.map(integration => (
                <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                        <Image src={integration.logo} alt={`${integration.name} logo`} width={32} height={32} className="h-8 w-8 rounded-md object-contain" data-ai-hint={integration.dataAiHint} />
                        <div>
                            <p className="font-medium text-foreground">{integration.name}</p>
                            <p className={`text-xs ${integration.connected ? 'text-accent' : 'text-muted-foreground'}`}>
                                {integration.connected ? 'Connected' : 'Not Connected'} - <span className="text-muted-foreground/80">{integration.description}</span>
                            </p>
                        </div>
                    </div>
                    <Button 
                        variant={integration.connected ? "outline" : "default"} 
                        size="sm" 
                        onClick={() => handleIntegrationConnect(integration.name, integration.connected)}
                    >
                        {integration.connected ? 'Manage' : 'Connect'}
                    </Button>
                </div>
            ))}
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
            <Globe className="mr-2 h-5 w-5 text-primary" /> {/* Main Icon */}
            Localization Settings
          </CardTitle>
          <CardDescription>Set your preferred regional settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="default-currency" className="text-base font-medium">Default Currency</Label>
            <p className="text-sm text-muted-foreground mb-2">Select the default currency for your billing and reports.</p>
            <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
              <SelectTrigger className="w-full md:w-[280px]" id="default-currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - United States Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound Sterling</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div>
            <Label htmlFor="preferred-language" className="text-base font-medium flex items-center">
             <Languages className="mr-2 h-4 w-4 text-muted-foreground"/> Preferred Language
            </Label>
            <p className="text-sm text-muted-foreground mb-2">Select the language for the application interface.</p>
            <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
              <SelectTrigger className="w-full md:w-[280px]" id="preferred-language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (US)</SelectItem>
                <SelectItem value="es">Español (Spanish)</SelectItem>
                <SelectItem value="fr">Français (French)</SelectItem>
                <SelectItem value="de">Deutsch (German)</SelectItem>
              </SelectContent>
            </Select>
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
