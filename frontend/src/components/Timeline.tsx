import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown, X, Calendar, Clock, MessageSquare, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type TimelineEntry } from '@/types/Timeline.type'

interface TimelineProps {
  entries: TimelineEntry[]
  isLoading?: boolean
  onEntryPress?: (entry: TimelineEntry) => void
  selectedTheme?: string | null
  onThemeFilter?: (theme: string | null) => void
}

export default function Timeline({ 
  entries, 
  isLoading = false, 
  onEntryPress,
  selectedTheme,
  onThemeFilter 
}: TimelineProps) {
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')


  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '#10B981' // green
      case 'negative':
        return '#EF4444' // red
      case 'mixed':
        return '#F59E0B' // amber
      case 'neutral':
      default:
        return '#6B7280' // gray
    }
  }


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleEntryPress = (entry: TimelineEntry) => {
    setSelectedEntry(entry)
    onEntryPress?.(entry)
  }

  const getAvailableThemes = () => {
    const themes = new Set<string>()
    entries.forEach(entry => {
      entry.themes.forEach(theme => {
        themes.add(theme.theme)
      })
    })
    return Array.from(themes).sort()
  }

  const getFilteredThemes = () => {
    const allThemes = getAvailableThemes()
    if (!searchQuery.trim()) return allThemes
    return allThemes.filter(theme => 
      theme.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const handleThemeSelect = (theme: string | null) => {
    onThemeFilter?.(theme)
    setIsDropdownOpen(false)
    setSearchQuery('')
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
            <span className="text-sm text-muted-foreground">Loading timeline...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No journal entries found</h3>
          <p className="text-sm text-muted-foreground">
            Start journaling to see your timeline
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Theme Filter */}
      {onThemeFilter && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Filter by theme:</label>
          <Dialog open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>{selectedTheme || 'All Themes'}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Select Theme Filter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Search themes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    <Button
                      variant={!selectedTheme ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleThemeSelect(null)}
                    >
                      All Themes
                    </Button>
                    {getFilteredThemes().map((theme) => (
                      <Button
                        key={theme}
                        variant={selectedTheme === theme ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleThemeSelect(theme)}
                      >
                        {theme}
                      </Button>
                    ))}
                    {getFilteredThemes().length === 0 && searchQuery.trim() && (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          No themes found matching "{searchQuery}"
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-6">
        {entries.map((entry, index) => (
          <div key={entry.id} className="relative flex items-start space-x-4">
            {/* Timeline Line */}
            {index < entries.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-full bg-border" />
            )}
            
            {/* Entry Marker */}
            <button
              className="relative z-10 w-12 h-12 rounded-full border-4 border-background shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: getSentimentColor(entry.sentiment.overall) }}
              onClick={() => handleEntryPress(entry)}
            >
              <div className="w-4 h-4 rounded-full bg-background" />
            </button>

            {/* Entry Content */}
            <Card 
              className={cn(
                "flex-1 transition-all duration-200 hover:shadow-md cursor-pointer bg-white dark:bg-gray-800 border"
              )}
              style={{ borderColor: getSentimentColor(entry.sentiment.overall) }}
              onClick={() => handleEntryPress(entry)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(entry.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(entry.date)}</span>
                    </div>
                  </div>
                  <Badge 
                    variant="outline"
                    style={{ 
                      borderColor: getSentimentColor(entry.sentiment.overall),
                      color: getSentimentColor(entry.sentiment.overall)
                    }}
                  >
                    {entry.sentiment.overall}
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm overflow-hidden leading-relaxed text-gray-900 dark:text-gray-100" style={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    fontWeight: '400'
                  }}>
                    {entry.content}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span>{entry.wordCount} words</span>
                </div>

                {entry.themes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.themes.slice(0, 2).map((theme, themeIndex) => (
                      <Badge
                        key={themeIndex}
                        variant="outline"
                        className="text-xs"
                        style={{ 
                          borderColor: getSentimentColor(theme.sentiment_towards_theme),
                          color: getSentimentColor(theme.sentiment_towards_theme)
                        }}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {theme.theme}
                      </Badge>
                    ))}
                    {entry.themes.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{entry.themes.length - 2} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Entry Detail Modal */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Journal Entry</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(null)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedEntry && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(selectedEntry.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(selectedEntry.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Sentiment:</span>
                    <Badge 
                      variant="outline"
                      style={{ 
                        borderColor: getSentimentColor(selectedEntry.sentiment.overall),
                        color: getSentimentColor(selectedEntry.sentiment.overall)
                      }}
                    >
                      {selectedEntry.sentiment.overall}
                    </Badge>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Content</h4>
                    <p className="text-sm leading-relaxed mb-2">{selectedEntry.content}</p>
                    <p className="text-xs text-muted-foreground italic">{selectedEntry.wordCount} words</p>
                  </CardContent>
                </Card>

                {selectedEntry.summary && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">AI Summary</h4>
                      <p className="text-sm leading-relaxed">{selectedEntry.summary}</p>
                    </CardContent>
                  </Card>
                )}

                {selectedEntry.themes.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">Themes</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.themes.map((theme, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-3 space-y-1"
                            style={{ 
                              borderColor: getSentimentColor(theme.sentiment_towards_theme)
                            }}
                          >
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{ 
                                borderColor: getSentimentColor(theme.sentiment_towards_theme),
                                color: getSentimentColor(theme.sentiment_towards_theme)
                              }}
                            >
                              {theme.theme}
                            </Badge>
                            {theme.action_taken_or_planned && (
                              <p className="text-xs text-muted-foreground italic">
                                {theme.action_taken_or_planned}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedEntry.significantEvents.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">Key Learnings</h4>
                      <ul className="space-y-2">
                        {selectedEntry.significantEvents.map((event, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-accent font-semibold mt-1">•</span>
                            <span className="text-sm leading-relaxed">{event}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
