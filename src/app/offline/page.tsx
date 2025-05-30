import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WifiOff, Home, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <WifiOff className="w-16 h-16 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold mb-2">You&apos;re offline</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        It looks like you&apos;re not connected to the internet. Some features of ClimaBill may not be available.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go to Homepage
          </Link>
        </Button>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry Connection
        </Button>
      </div>
    </div>
  );
}
