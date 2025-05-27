import { SmartDiscountsForm } from "@/components/smart-discounts-form";

export default function SmartDiscountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Smart Discounts</h1>
        <p className="text-muted-foreground">
          Leverage AI to generate personalized discount offers based on user behavior.
        </p>
      </div>
      <SmartDiscountsForm />
    </div>
  );
}
