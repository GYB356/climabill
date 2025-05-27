
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { ClimaBillLogo } from "@/components/icons";
import { Download, Mail, Printer, Sparkles, Lightbulb, Leaf, Info, Globe } from "lucide-react"; 
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";


// Mock data for the sample invoice
const invoiceData = {
  id: "INV-2024-001",
  issueDate: "July 26, 2024",
  dueDate: "August 25, 2024",
  billedTo: {
    name: "Acme Corp",
    address: "123 Innovation Drive, Tech City, TX 75001",
    email: "accounts@acme.corp",
  },
  from: {
    name: "ClimaBill Solutions",
    address: "456 Sustainability Ave, Green Valley, CA 90210",
    email: "billing@climabill.com",
  },
  items: [
    { id: "1", description: "AI Consulting Services - Phase 1", quantity: 20, unitPrice: 150.00 },
    { id: "2", description: "Carbon Footprint Analysis Report", quantity: 1, unitPrice: 750.00 },
    { id: "3", description: "Sustainable Cloud Infrastructure Setup", quantity: 1, unitPrice: 1200.00 },
  ],
  subtotal: 0, // Will be calculated
  taxRate: 0.08, // 8%
  taxAmount: 0, // Will be calculated
  total: 0, // Will be calculated
  notes: "Thank you for your business! We appreciate your commitment to sustainability.",
  paymentTerms: "Net 30 Days. Late payments are subject to a 1.5% monthly interest.",
  carbonOffsetContribution: 25.00, // Optional
  currency: "USD", // Default currency
};

invoiceData.subtotal = invoiceData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
invoiceData.taxAmount = invoiceData.subtotal * invoiceData.taxRate;
invoiceData.total = invoiceData.subtotal + invoiceData.taxAmount + (invoiceData.carbonOffsetContribution || 0);


export default function SampleInvoicePage({ params }: { params: { id: string } }) {
  // In a real app, you'd fetch invoice data based on params.id
  // For this prototype, we use static mock data if params.id is 'sample-invoice'
  const [invoiceCurrency, setInvoiceCurrency] = useState(invoiceData.currency);

  if (params.id !== "sample-invoice") {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Invoice Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The invoice with ID "{params.id}" could not be found.</p>
                    <Button asChild variant="link" className="mt-4">
                        <Link href="/invoices/sample-invoice">View Sample Invoice</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }


  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-background rounded-lg shadow-2xl border my-8">
      {/* Invoice Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <ClimaBillLogo className="h-10 text-primary mb-2" />
          <p className="text-sm text-muted-foreground">{invoiceData.from.address}</p>
          <p className="text-sm text-muted-foreground">{invoiceData.from.email}</p>
        </div>
        <div className="text-right mt-4 sm:mt-0">
          <h1 className="text-3xl font-bold text-foreground mb-1">INVOICE</h1>
          <p className="text-muted-foreground">#{invoiceData.id}</p>
           <div className="mt-2">
            <Select value={invoiceCurrency} onValueChange={setInvoiceCurrency}>
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <Globe className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Invoice Currency</p>
          </div>
        </div>
      </div>

      {/* Client and Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-1">BILLED TO</h2>
          <p className="font-medium text-foreground">{invoiceData.billedTo.name}</p>
          <p className="text-sm text-muted-foreground">{invoiceData.billedTo.address}</p>
          <p className="text-sm text-muted-foreground">{invoiceData.billedTo.email}</p>
        </div>
        <div className="sm:text-right">
          <div className="mb-2">
            <p className="text-sm font-semibold text-muted-foreground">Issue Date</p>
            <p className="text-foreground">{invoiceData.issueDate}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Due Date</p>
            <p className="font-semibold text-primary">{invoiceData.dueDate}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <Card className="mb-8 shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[60%] sm:w-[50%]">Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price ({invoiceCurrency})</TableHead>
                <TableHead className="text-right">Amount ({invoiceCurrency})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceData.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-foreground">{item.description}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.quantity}</TableCell>
                  <TableCell className="text-right text-muted-foreground">${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold text-foreground">${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-muted/50">
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium text-muted-foreground">Subtotal</TableCell>
                <TableCell className="text-right font-semibold text-foreground">${invoiceData.subtotal.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium text-muted-foreground flex items-center justify-end gap-1.5">
                  Tax ({invoiceData.taxRate * 100}%)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-primary cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs">
                        <p>Tax automatically calculated based on your region and settings (configurable in Billing Settings).</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-right font-semibold text-foreground">${invoiceData.taxAmount.toFixed(2)}</TableCell>
              </TableRow>
              {invoiceData.carbonOffsetContribution > 0 && (
                 <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium text-muted-foreground flex items-center justify-end gap-1.5">
                        <Leaf className="h-4 w-4 text-accent inline-block"/> Carbon Offset Contribution
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">${invoiceData.carbonOffsetContribution.toFixed(2)}</TableCell>
                </TableRow>
              )}
              <TableRow className="border-t-2 border-primary">
                <TableCell colSpan={3} className="text-right text-lg font-bold text-primary pt-4">Total Amount Due ({invoiceCurrency})</TableCell>
                <TableCell className="text-right text-lg font-bold text-primary pt-4">${invoiceData.total.toFixed(2)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
      
      {/* Conceptual AI Item Suggester Link */}
      <div className="mb-8 flex justify-end">
        <Button variant="outline" size="sm" asChild>
            <Link href="/invoice-item-suggester">
                <Lightbulb className="mr-2 h-4 w-4 text-primary"/> Suggest New Line Item with AI
            </Link>
        </Button>
      </div>


      {/* Notes and Payment Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">NOTES</h3>
          <p className="text-xs text-muted-foreground">{invoiceData.notes}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">PAYMENT TERMS</h3>
          <p className="text-xs text-muted-foreground">{invoiceData.paymentTerms}</p>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
        <Button size="lg" className="w-full sm:w-auto">
          <Mail className="mr-2 h-5 w-5" /> Send Invoice
        </Button>
        <Button variant="outline" size="lg" className="w-full sm:w-auto">
          <Printer className="mr-2 h-5 w-5" /> Print
        </Button>
        <Button variant="outline" size="lg" className="w-full sm:w-auto">
          <Download className="mr-2 h-5 w-5" /> Download PDF
        </Button>
      </div>

       <div className="mt-12 text-center text-xs text-muted-foreground">
        <p>Powered by ClimaBill - Smart & Sustainable Billing</p>
        <p>If you have any questions concerning this invoice, please contact <a href={`mailto:${invoiceData.from.email}`} className="text-primary hover:underline">{invoiceData.from.email}</a></p>
      </div>
    </div>
  );
}

    