import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, safeRequest } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, FileText, Smile, Frown, Meh } from 'lucide-react'
import moment from 'moment'
import { Loader } from '@/components/Loader'
import { useAiInsightStore } from '@/stores/ai-insight.store'
import { Badge } from '@/components/ui/badge'

type JournalEntry = {
  _id: string
  content: string
  entry_date: string
  word_count: number
}

export function JournalView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { journalSentiment, fetchJournalSentiment } = useAiInsightStore()

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id) return
      setIsLoading(true)
      const res = await safeRequest(api.get<JournalEntry>(`/journal/${id}`))
      if (res.ok) {
        setEntry(res.data)
        fetchJournalSentiment(id)
      } else {
        setError(res.error)
      }
      setIsLoading(false)
    }
    fetchEntry()
  }, [id, fetchJournalSentiment])

  const getSentimentIcon = (label: string) => {
    if (label === 'positive') return <Smile className="h-4 w-4 text-green-500" />
    if (label === 'negative') return <Frown className="h-4 w-4 text-red-500" />
    return <Meh className="h-4 w-4 text-yellow-500" />
  }

  if (isLoading) {
    return <Loader />
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="text-destructive mb-4">Error: {error}</div>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="mb-4">Journal entry not found.</div>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  const formattedDate = moment(entry.entry_date).format('MMMM Do YYYY, h:mm:ss a')

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          Go Back
        </Button>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-4">
                {journalSentiment && (
                  <Badge variant="outline" className="flex items-center gap-2">
                    {getSentimentIcon(journalSentiment.sentiment_label)}
                    <span>{journalSentiment.sentiment_label} ({journalSentiment.sentiment_score * 100}%)</span>
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">{entry.word_count} words</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Journal Entry
            </CardTitle>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
