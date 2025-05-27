
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle, Star, Sparkles, Leaf, LayoutDashboard, Package, Zap, Briefcase, CheckCircle } from 'lucide-react';
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
} from "@/components/ui/dialog";

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

      {/* Demo Video Placeholder */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">See ClimaBill in Action</h2>
          <Dialog>
            <DialogTrigger asChild>
              <div className="aspect-video bg-muted rounded-lg shadow-xl max-w-3xl mx-auto flex items-center justify-center relative overflow-hidden cursor-pointer group">
                <Image
                  src="https://placehold.co/1280x720.png"
                  alt="ClimaBill Demo Video Thumbnail"
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="app screen"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center flex-col group-hover:bg-black/40 transition-colors duration-300">
                  <PlayCircle className="w-20 h-20 text-white/80 group-hover:text-white transition-colors duration-300 mb-2 group-hover:scale-110 transform" />
                  <p className="mt-2 text-white/90 text-lg font-semibold">Watch Demo</p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] p-0">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-2xl">ClimaBill Demo Video</DialogTitle>
                <DialogDescription>
                  See how ClimaBill can revolutionize your billing and sustainability efforts.
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 aspect-video bg-black flex items-center justify-center">
                <Image
                  src="https://placehold.co/1280x720/333333/FFFFFF.png?text=Video+Player+Placeholder" 
                  alt="Demo Video Player Placeholder"
                  width={1280}
                  height={720}
                  className="rounded-md"
                  data-ai-hint="video player interface"
                />
              </div>
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
              { name: "Alex P. - SaaS Founder", quote: "ClimaBill revolutionized how we handle subscriptions and helped us highlight our eco-commitment! The AI suggestions save us hours." },
              { name: "Sarah L. - Freelance Designer", quote: "The AI invoice item suggester is a lifesaver, and my clients love the clean, modern templates. Plus, the carbon tracking is a great touch." },
              { name: "EcoHarvest Ltd. - Sustainability Lead", quote: "Finally, a billing platform that aligns with our sustainable values. The carbon footprint tracking and offset options are fantastic for our reporting." },
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
            {[
              { tier: 'Basic', price: '29', icon: Package, features: ['AI Invoice Item Suggester', 'Basic Carbon Tracking', '100 Invoices/mo'] },
              { tier: 'Pro', price: '79', icon: Zap, features: ['Smart Discounts AI', 'Advanced Carbon Offsetting', '500 Invoices/mo', 'Priority Support', 'Optional "Green Tier" auto-donation'], highlighted: true },
              { tier: 'Enterprise', price: '199', icon: Briefcase, features: ['All Pro Features', 'Custom AI Models', 'Unlimited Invoices', 'Dedicated Account Manager', 'Includes "Green Tier" auto-donation'] },
            ].map(plan => (
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
                <Button size="lg" variant={plan.highlighted ? 'default' : 'outline'} className="w-full mt-auto">
                  Get Started
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-muted-foreground">Need something different? <Link href="/#contact" className="text-primary underline hover:text-primary/80">Contact us</Link> for custom plans.</p>
        </div>
      </section>

      {/* Contact Section Placeholder */}
      <section id="contact" className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Get in Touch</h2>
          <p className="text-muted-foreground mb-8">
            Have questions or need a custom solution? We're here to help.
          </p>
          <form className="space-y-6">
            <Input type="text" placeholder="Your Name" className="bg-card" />
            <Input type="email" placeholder="Your Email" className="bg-card" />
            <Textarea placeholder="Your Message" className="bg-card min-h-[120px]" />
            <Button size="lg" type="submit">Send Message</Button>
          </form>
        </div>
      </section>

      {/* Privacy Policy Placeholder Section */}
      <section id="privacy" className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-4">Privacy Policy</h2>
          <p className="text-muted-foreground mb-2">Last updated: {new Date().toLocaleDateString()}</p>
          <p className="text-muted-foreground">Details about how we handle your data will go here. For now, this is a placeholder.</p>
        </div>
      </section>

      {/* Terms of Service Placeholder Section */}
      <section id="terms" className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-4">Terms of Service</h2>
          <p className="text-muted-foreground mb-2">Effective date: {new Date().toLocaleDateString()}</p>
          <p className="text-muted-foreground">Our terms and conditions for using ClimaBill will be detailed here. This is currently a placeholder.</p>
        </div>
      </section>

    </div>
  );
}
