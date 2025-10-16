import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, BookOpen, ArrowRight } from 'lucide-react'
import { useThemeDetailStore } from '@/stores/theme-detail.store'
import { cn } from '@/lib/utils'

export function ThemeDetail() {
  const { theme, period = 'all' } = useParams<{ theme: string; period: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isLoadingMore, error, fetchThemeEntries, loadMoreEntries } = useThemeDetailStore()

  useEffect(() => {
    if (theme) {
      fetchThemeEntries(theme, period)
    }
  }, [theme, period, fetchThemeEntries])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '#10B981'
      case 'negative':
        return '#EF4444'
      case 'mixed':
        return '#F59E0B'
      case 'neutral':
      default:
        return '#EAB308'
    }
  }

  const getSentimentBackgroundColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 dark:bg-green-900/20'
      case 'negative':
        return 'bg-red-50 dark:bg-red-900/20'
      case 'mixed':
        return 'bg-amber-50 dark:bg-amber-900/20'
      case 'neutral':
      default:
        return 'bg-yellow-50 dark:bg-yellow-900/20'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleLoadMore = async () => {
    if (theme && data?.pagination.hasNextPage) {
      await loadMoreEntries(theme, period)
    }
  }

  const handleEntryClick = (entryId: string) => {
    navigate(`/journals/${entryId}`)
  }

  if (isLoading && !data) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Theme Details</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
            <span className="text-sm text-muted-foreground">Loading theme entries...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Theme Details</h1>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => theme && fetchThemeEntries(theme, period)}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data || data.entries.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Theme Details</h1>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No entries found</h3>
            <p className="text-sm text-muted-foreground">
              No journal entries found for the theme "{theme}"
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Theme Details</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme Header */}
        <Card className="border shadow-sm">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-accent mb-2">
              "{theme}"
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {data.pagination.totalEntries} journal entries
              {period !== 'all' && (
                <span> • {period.charAt(0).toUpperCase() + period.slice(1)}</span>
              )}
            </p>
            {data.dateRange && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {formatDate(data.dateRange.start)} - {formatDate(data.dateRange.end)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Theme Entries */}
        <div className="space-y-4">
          {data.entries.map((entry) => (
            <Card 
              key={entry.id} 
              className="border shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(entry.entry_date)}</span>
                  </div>
                  <Badge 
                    variant="outline"
                    className={cn("capitalize", getSentimentBackgroundColor(entry.sentiment.overall))}
                    style={{ 
                      borderColor: getSentimentColor(entry.sentiment.overall),
                      color: getSentimentColor(entry.sentiment.overall)
                    }}
                  >
                    {entry.sentiment.overall}
                  </Badge>
                </div>
                
                <p className="text-gray-900 dark:text-gray-100 mb-4 overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {entry.content}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.word_count} words
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEntryClick(entry.id)}
                    className="text-accent border-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    Read More
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>

                {entry.summary && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-accent mb-2">Summary</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {entry.summary}
                    </p>
                  </div>
                )}

                {entry.key_learnings.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-accent mb-2">Key Learnings</h4>
                    <ul className="space-y-1">
                      {entry.key_learnings.map((learning, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-accent font-semibold mt-1">•</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {learning}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        {data.pagination.hasNextPage && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="w-full max-w-sm"
            >
              {isLoadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent mr-2"></div>
                  Loading more entries...
                </>
              ) : (
                'Load More Entries'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
