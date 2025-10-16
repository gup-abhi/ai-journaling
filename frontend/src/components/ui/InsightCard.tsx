import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InsightCardProps {
  title: string
  subtitle?: string
  value: string | number
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: number
    description: string
  }
  icon?: React.ReactNode
  textColor?: string
  onPress?: () => void
  children?: React.ReactNode
  className?: string
}

export default function InsightCard({
  title,
  subtitle,
  value,
  trend,
  icon,
  textColor,
  onPress,
  children,
  className
}: InsightCardProps) {
  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground'
    switch (trend.direction) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-muted-foreground'
    }
  }
  
  const getTrendIcon = () => {
    if (!trend) return null
    switch (trend.direction) {
      case 'up': return <TrendingUp className="h-4 w-4" />
      case 'down': return <TrendingDown className="h-4 w-4" />
      default: return <Minus className="h-4 w-4" />
    }
  }

  const CardComponent = () => (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md border shadow-sm",
      onPress && "cursor-pointer hover:scale-[1.02]",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className={cn("text-lg font-semibold", textColor && `text-[${textColor}]`)}>
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="ml-4">{icon}</div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("text-2xl font-bold", textColor && `text-[${textColor}]`)}>
            {value}
          </div>
          {trend && (
            <div className={cn("flex items-center space-x-1", getTrendColor())}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {trend.description}
              </span>
            </div>
          )}
        </div>
        
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (onPress) {
    return (
      <div onClick={onPress} className="cursor-pointer">
        <CardComponent />
      </div>
    )
  }

  return <CardComponent />
}
