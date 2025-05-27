
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Save, BellRing, Leaf } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton

const reminderOptions = [
  { id: "7days", label: "7 days before deadline" },
  { id: "3days", label: "3 days before deadline" },
  { id: "1day", label: "1 day before deadline" },
  { id: "onDeadline", label: "On the deadline" },
];

export default function SettingsPage() {
  const [paymentDeadline, setPaymentDeadline] = useState<Date | undefined>(undefined); 
  const [selectedReminders, setSelectedReminders] = useState<string[]>(["3days", "1day"]);
  const [enableCarbonOffset, setEnableCarbonOffset] = useState(true);
  const [carbonOffsetAmount, setCarbonOffsetAmount] = useState("5.00");
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    // Set default date only after mounting to avoid hydration mismatch
    setPaymentDeadline(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)); 
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
      paymentDeadline,
      selectedReminders,
      enableCarbonOffset,
      carbonOffsetAmount,
    });
    toast({
      title: "Settings Saved!",
      description: "Your preferences have been updated successfully.",
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
                    <Skeleton className="h-6 w-3/4 mb-1 rounded-md flex items-center" />
                    <Skeleton className="h-4 w-full rounded-md" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Skeleton className="h-5 w-1/3 mb-2 rounded-md" />
                        <Skeleton className="h-10 w-full md:w-[280px] rounded-md" />
                    </div>
                    <div>
                        <Skeleton className="h-5 w-1/3 mb-2 rounded-md" />
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
                  <Skeleton className="h-6 w-3/4 mb-1 rounded-md flex items-center" />
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
                    {/* Conditional skeleton for offset amount - assuming enableCarbonOffset is true initially for skeleton */}
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-1/3 mb-1 rounded-md bg-muted" />
                        <Skeleton className="h-10 w-full md:w-[280px] rounded-md bg-muted" />
                        <Skeleton className="h-3 w-3/4 rounded-md bg-muted" />
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Skeleton className="h-11 w-44 rounded-md bg-muted" />
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your billing and platform preferences.</p>
      </div>

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
            <Label htmlFor="payment-deadline" className="text-base font-medium">Default Payment Deadline</Label>
            <p className="text-sm text-muted-foreground mb-2">Set the default number of days until an invoice is due.</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[280px] justify-start text-left font-normal",
                    !paymentDeadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDeadline ? format(paymentDeadline, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={paymentDeadline}
                  onSelect={setPaymentDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
            Carbon Offset Program
          </CardTitle>
          <CardDescription>Opt-in to offset carbon emissions associated with your services.</CardDescription>
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
            <div className="space-y-2">
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
