
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClimaBillLogo } from '@/components/icons'; // Assuming this is suitable for landing
import Image from 'next/image';
import { ArrowRight, PlayCircle, Star } from 'lucide-react';

export default function HomePage() {
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

      {/* Features Overview (Simplified) */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Why ClimaBill?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 border rounded-lg shadow-lg bg-card">
              <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">AI-Powered Insights</h3>
              <p className="text-muted-foreground">Automate billing, get smart discount suggestions, and understand your revenue streams like never before.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-lg bg-card">
              <LeafIcon className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Climate Conscious</h3>
              <p className="text-muted-foreground">Track your carbon footprint, offer offset options, and build a more sustainable business.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-lg bg-card">
              <LayoutDashboardIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Seamless Workflow</h3>
              <p className="text-muted-foreground">Modern invoice templates, automated reminders, and an intuitive dashboard to manage it all.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Placeholder */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">See ClimaBill in Action</h2>
          <div className="aspect-video bg-muted rounded-lg shadow-xl max-w-3xl mx-auto flex items-center justify-center">
            {/* Replace with an iframe or next/image for an actual thumbnail */}
            <PlayCircle className="w-20 h-20 text-primary opacity-50" />
            <p className="absolute text-muted-foreground">Demo video coming soon!</p>
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Loved by Businesses Like Yours</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Alex P. - SaaS Founder", quote: "ClimaBill revolutionized how we handle subscriptions and helped us highlight our eco-commitment!" },
              { name: "Sarah L. - Freelance Designer", quote: "The AI invoice item suggester is a lifesaver, and my clients love the clean templates." },
              { name: "EcoHarvest Ltd.", quote: "Finally, a billing platform that aligns with our sustainable values. The carbon tracking is fantastic." },
            ].map((testimonial, index) => (
              <div key={index} className="p-6 bg-card border rounded-lg shadow-lg">
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-accent fill-accent" />)}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                <p className="font-semibold text-card-foreground text-right">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Placeholder icons (replace with lucide-react imports if not already global or pass as props)
function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2z"/>
      <path d="M5 5L6 7"/>
      <path d="M17 18L18 19"/>
    </svg>
  )
}

function LeafIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 4 13V7a5 5 0 0 1 5-5h1"/>
      <path d="M12 20v-1a4 4 0 0 0-4-4H4"/>
      <path d="M12 16a4 4 0 0 1 4-4h4a5 5 0 0 1 5 5v1a7 7 0 0 1-7 7h-1"/>
    </svg>
  )
}

function LayoutDashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/>
      <rect width="7" height="5" x="14" y="3" rx="1"/>
      <rect width="7" height="9" x="14" y="12" rx="1"/>
      <rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  )
}
