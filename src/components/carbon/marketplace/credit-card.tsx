import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CarbonCredit } from '@/lib/carbon/marketplace/types';

interface CreditCardProps {
  credit: CarbonCredit;
  onSelect: () => void;
}

export function CreditCard({ credit, onSelect }: CreditCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="h-40 bg-gray-100 relative">
        {credit.imageUrl && (
          <img 
            src={credit.imageUrl} 
            alt={credit.projectName}
            className="w-full h-full object-cover"
          />
        )}
        {credit.isVerified && (
          <Badge className="absolute top-2 right-2 bg-green-600">
            Verified on Blockchain
          </Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{credit.projectName}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span>{credit.creditType.replace('_', ' ')}</span>
          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
            {credit.vintage}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted-foreground">Price</span>
          <span className="font-medium">${credit.price.toFixed(2)} / kg</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted-foreground">Available</span>
          <span className="font-medium">{credit.quantity.toLocaleString()} kg</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Location</span>
          <span className="font-medium">{credit.location}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
          {credit.description}
        </p>
      </CardContent>
      <CardFooter className="pt-0 mt-auto">
        <Button className="w-full" onClick={onSelect}>
          Purchase Credits
        </Button>
      </CardFooter>
    </Card>
  );
}
