import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type TopThemesData } from '@/types/ThematicSentiment.type'
import { useNavigate } from 'react-router-dom'

interface TopThemesCardProps {
  data: TopThemesData
  onThemeClick?: (theme: string) => void
  className?: string
}

export default function TopThemesCard({ data, onThemeClick, className }: TopThemesCardProps) {
  const navigate = useNavigate()
  const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral' | 'mixed') => {
    switch (sentiment) {
      case 'positive':
        return '#10B981' // green
      case 'negative':
        return '#EF4444' // red
      case 'mixed':
        return '#F59E0B' // amber
      case 'neutral':
      default:
        return '#EAB308' // yellow
    }
  }

  const getSentimentBackgroundColor = (sentiment: 'positive' | 'negative' | 'neutral' | 'mixed') => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'negative':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'mixed':
        return 'bg-amber-50 border-amber-200 text-amber-800'
      case 'neutral':
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
  }

  const handleThemeClick = (theme: string) => {
    // Call the optional callback first
    onThemeClick?.(theme)
    
    // Navigate to theme detail page
    navigate(`/theme/${encodeURIComponent(theme)}/${data.period || 'all'}`)
  }

  return (
    <Card className={cn("border shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-accent">Top Themes</CardTitle>
      </CardHeader>
      <CardContent>
        {data.top_themes.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {data.top_themes.map((theme, index) => (
                <Badge
                  key={`${theme.theme}-${index}`}
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:scale-105",
                    getSentimentBackgroundColor(theme.dominant_sentiment)
                  )}
                  style={{ borderColor: getSentimentColor(theme.dominant_sentiment) }}
                  onClick={() => handleThemeClick(theme.theme)}
                >
                  <span className="font-medium">{theme.theme}</span>
                  <span className="ml-2 px-1.5 py-0.5 bg-black/10 rounded text-xs font-semibold">
                    {theme.frequency}
                  </span>
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center italic">
              Click on any theme to explore related journal entries
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No themes data available
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Start journaling to see your recurring themes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
