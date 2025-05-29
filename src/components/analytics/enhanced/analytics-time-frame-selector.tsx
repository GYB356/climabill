'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { AnalyticsTimeFrame } from '@/lib/analytics/enhanced/types';

interface AnalyticsTimeFrameSelectorProps {
  timeFrame: AnalyticsTimeFrame;
  period?: { startDate: Date; endDate: Date };
  onChange: (timeFrame: AnalyticsTimeFrame, period?: { startDate: Date; endDate: Date }) => void;
}

export function AnalyticsTimeFrameSelector({ timeFrame, period, onChange }: AnalyticsTimeFrameSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(
    period ? { from: period.startDate, to: period.endDate } : undefined
  );

  // Handle time frame button click
  const handleTimeFrameClick = (newTimeFrame: AnalyticsTimeFrame) => {
    if (newTimeFrame === AnalyticsTimeFrame.CUSTOM) {
      setIsCalendarOpen(true);
      return;
    }

    // Calculate period based on time frame
    let newPeriod;
    const now = new Date();
    
    switch (newTimeFrame) {
      case AnalyticsTimeFrame.DAY:
        // Last 24 hours
        newPeriod = {
          startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          endDate: now
        };
        break;
      case AnalyticsTimeFrame.WEEK:
        // Last 7 days
        newPeriod = {
          startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          endDate: now
        };
        break;
      case AnalyticsTimeFrame.MONTH:
        // Last 30 days
        newPeriod = {
          startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          endDate: now
        };
        break;
      case AnalyticsTimeFrame.QUARTER:
        // Last 90 days
        newPeriod = {
          startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
          endDate: now
        };
        break;
      case AnalyticsTimeFrame.YEAR:
        // Last 365 days
        newPeriod = {
          startDate: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
          endDate: now
        };
        break;
      default:
        newPeriod = undefined;
    }

    setDateRange(newPeriod ? { from: newPeriod.startDate, to: newPeriod.endDate } : undefined);
    onChange(newTimeFrame, newPeriod);
  };

  // Handle date range selection
  const handleDateRangeSelect = (range: { from?: Date; to?: Date }) => {
    if (range.from && range.to) {
      const newDateRange = { from: range.from, to: range.to };
      setDateRange(newDateRange);
      
      // Only call onChange when both dates are selected
      if (range.from && range.to) {
        const newPeriod = {
          startDate: range.from,
          endDate: range.to
        };
        onChange(AnalyticsTimeFrame.CUSTOM, newPeriod);
        setIsCalendarOpen(false);
      }
    } else {
      setDateRange(range as any);
    }
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange?.from || !dateRange?.to) {
      return 'Select date range';
    }
    
    return `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
  };

  // Get button variant based on active time frame
  const getButtonVariant = (buttonTimeFrame: AnalyticsTimeFrame) => {
    return timeFrame === buttonTimeFrame ? 'default' : 'outline';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center rounded-md border">
        <Button
          variant={getButtonVariant(AnalyticsTimeFrame.DAY)}
          size="sm"
          onClick={() => handleTimeFrameClick(AnalyticsTimeFrame.DAY)}
          className="rounded-r-none"
        >
          Day
        </Button>
        <Button
          variant={getButtonVariant(AnalyticsTimeFrame.WEEK)}
          size="sm"
          onClick={() => handleTimeFrameClick(AnalyticsTimeFrame.WEEK)}
          className="rounded-none border-l"
        >
          Week
        </Button>
        <Button
          variant={getButtonVariant(AnalyticsTimeFrame.MONTH)}
          size="sm"
          onClick={() => handleTimeFrameClick(AnalyticsTimeFrame.MONTH)}
          className="rounded-none border-l"
        >
          Month
        </Button>
        <Button
          variant={getButtonVariant(AnalyticsTimeFrame.QUARTER)}
          size="sm"
          onClick={() => handleTimeFrameClick(AnalyticsTimeFrame.QUARTER)}
          className="rounded-none border-l"
        >
          Quarter
        </Button>
        <Button
          variant={getButtonVariant(AnalyticsTimeFrame.YEAR)}
          size="sm"
          onClick={() => handleTimeFrameClick(AnalyticsTimeFrame.YEAR)}
          className="rounded-l-none border-l"
        >
          Year
        </Button>
      </div>

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={timeFrame === AnalyticsTimeFrame.CUSTOM ? 'default' : 'outline'}
            size="sm"
            className="min-w-[240px] justify-start text-left font-normal"
            onClick={() => handleTimeFrameClick(AnalyticsTimeFrame.CUSTOM)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {timeFrame === AnalyticsTimeFrame.CUSTOM ? formatDateRange() : 'Custom Range'}
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateRangeSelect}
            numberOfMonths={2}
            defaultMonth={dateRange?.from || new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
