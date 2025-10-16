import { Card, CardContent } from '@/components/ui/card'
import { Clock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineButtonProps {
  onPress?: () => void
  className?: string
}

export default function TimelineButton({ onPress, className }: TimelineButtonProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.01]",
        className
      )}
      onClick={onPress}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                Interactive Timeline
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Explore your journal entries chronologically
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}
