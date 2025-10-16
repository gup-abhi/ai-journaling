import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PeriodSelectorProps {
  selectedPeriod: 'week' | 'month' | 'year'
  onPeriodChange: (period: 'week' | 'month' | 'year') => void
  className?: string
}

export default function PeriodSelector({ selectedPeriod, onPeriodChange, className }: PeriodSelectorProps) {
  const periods: Array<{ value: 'week' | 'month' | 'year'; label: string }> = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' }
  ]

  return (
    <div className={cn("flex space-x-2", className)}>
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={selectedPeriod === period.value ? "default" : "outline"}
          size="sm"
          onClick={() => onPeriodChange(period.value)}
          className="flex-1"
        >
          {period.label}
        </Button>
      ))}
    </div>
  )
}
