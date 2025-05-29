'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CarbonCredit } from '@/lib/carbon/marketplace/types';

interface PurchaseModalProps {
  credit: CarbonCredit;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
}

export function PurchaseModal({ credit, isOpen, onClose, onPurchaseComplete }: PurchaseModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Calculate total price
  const totalPrice = quantity * credit.price;

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (value > credit.quantity) {
      setQuantity(credit.quantity);
    } else {
      setQuantity(value);
    }
  };

  // Handle purchase
  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call API to purchase credits
      const response = await fetch('/api/carbon/marketplace/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditId: credit.id,
          quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to purchase carbon credits');
      }

      // Show success message
      setSuccess(true);

      // Close modal after delay
      setTimeout(() => {
        onClose();
        onPurchaseComplete();
        setSuccess(false);
        setQuantity(1);
      }, 2000);
    } catch (error) {
      console.error('Error purchasing carbon credits:', error);
      setError(error instanceof Error ? error.message : 'Failed to purchase carbon credits');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Purchase Carbon Credits</DialogTitle>
          <DialogDescription>
            Purchase verified carbon credits to offset your emissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
              {credit.imageUrl && (
                <img
                  src={credit.imageUrl}
                  alt={credit.projectName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{credit.projectName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">{credit.creditType.replace('_', ' ')}</span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                  {credit.vintage}
                </span>
              </div>
              {credit.isVerified && (
                <Badge className="mt-2 bg-green-600">Verified on Blockchain</Badge>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price per kg</Label>
                <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                  ${credit.price.toFixed(2)}
                </div>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={credit.quantity}
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              </div>
            </div>

            <div>
              <Label>Total Price</Label>
              <div className="h-10 px-3 py-2 rounded-md border border-input bg-green-50 text-green-700 font-semibold flex items-center">
                ${totalPrice.toFixed(2)}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>{credit.description}</p>
              <p className="mt-2">
                Verification Standard: {credit.verificationStandard.replace('_', ' ')}
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-500 p-2 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-500 p-2 bg-green-50 rounded-md">
                Purchase successful! Your carbon credits have been added to your portfolio.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} disabled={isLoading || success}>
            {isLoading ? 'Processing...' : 'Purchase Credits'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
