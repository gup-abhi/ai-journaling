import React, { useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import Calendar from 'react-calendar';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import 'react-calendar/dist/Calendar.css';
import '../../styles/Calendar.css';

interface DateFilterProps {
  onDateSelect: (filters: { month?: number; year?: number }) => void;
  currentFilters?: { month?: number; year?: number };
}

export function DateFilter({ onDateSelect, currentFilters }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<'month' | 'year'>('month');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const handleMonthSelect = (month: string) => {
    const monthNum = parseInt(month);
    setSelectedMonth(monthNum);
    setSelectedYear(selectedYear || new Date().getFullYear());
  };

  const handleYearSelect = (year: string) => {
    const yearNum = parseInt(year);
    setSelectedYear(yearNum);
    if (filterType === 'month' && !selectedMonth) {
      setSelectedMonth(1); // Default to January if month filter
    }
  };

  const applyFilter = () => {
    let filters: { month?: number; year?: number } = {};

    if (filterType === 'month' && selectedMonth && selectedYear) {
      filters.month = selectedMonth;
      filters.year = selectedYear;
    } else if (filterType === 'year' && selectedYear) {
      filters.year = selectedYear;
    }

    if (Object.keys(filters).length > 0) {
      onDateSelect(filters);
      setIsOpen(false);
    }
  };

  const clearFilter = () => {
    setSelectedMonth(null);
    setSelectedYear(null);
    onDateSelect({});
    setIsOpen(false);
  };

  const getCurrentFilterText = () => {
    if (currentFilters?.month && currentFilters?.year) {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `Month: ${monthNames[currentFilters.month - 1]} ${currentFilters.year}`;
    }
    if (currentFilters?.year) {
      return `Year: ${currentFilters.year}`;
    }
    return 'All Journals';
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{getCurrentFilterText()}</span>
          <span className="sm:hidden">Filter</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Journals by Date</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filter Type Selection */}
          <div>
            <label className="text-sm font-medium">Filter Type</label>
            <Select value={filterType} onValueChange={(value: 'month' | 'year') => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month & Year</SelectItem>
                <SelectItem value="year">Year Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Month and Year Selection */}
          {filterType === 'month' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Month</label>
                <Select value={selectedMonth?.toString()} onValueChange={handleMonthSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="2">February</SelectItem>
                    <SelectItem value="3">March</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">June</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="8">August</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Year</label>
                <Select value={selectedYear?.toString()} onValueChange={handleYearSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Year Only Selection */}
          {filterType === 'year' && (
            <div>
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear?.toString()} onValueChange={handleYearSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={applyFilter} className="flex-1">
              Apply Filter
            </Button>
            <Button variant="outline" onClick={clearFilter} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
