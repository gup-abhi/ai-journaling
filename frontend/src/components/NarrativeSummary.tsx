import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface NarrativeSummaryProps {
  summary: string
  onPress?: () => void
  className?: string
}

export default function NarrativeSummary({ summary, onPress, className }: NarrativeSummaryProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md border shadow-sm",
        onPress && "cursor-pointer hover:scale-[1.01]",
        className
      )}
      onClick={onPress}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-2xl text-accent">💭</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-accent mb-3 tracking-wide">
              Your Story
            </h3>
            <p className="text-base leading-relaxed font-medium italic text-gray-900 dark:text-gray-100">
              {summary}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
