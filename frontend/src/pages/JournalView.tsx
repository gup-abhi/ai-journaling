import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, safeRequest } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Smile, Frown, Meh } from 'lucide-react'
import moment from 'moment'
import { Loader } from '@/components/Loader'
import { useAiInsightStore } from '@/stores/ai-insight.store'
import { Badge } from '@/components/ui/badge'
import * as Tooltip from '@radix-ui/react-tooltip'
import type { JournalTemplate } from '@/types/JournalTemplate'

type JournalEntry = {
  _id: string
  content: string
  entry_date: string
  word_count: number
  template_id?: string
}

export function JournalView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [template, setTemplate] = useState<JournalTemplate | null>(null)

  const { journalSentiment, keyThemes, fetchJournalSentiment } = useAiInsightStore()

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id) return
      setIsLoading(true)
      const res = await safeRequest(api.get<JournalEntry>(`/journal/${id}`))
      if (res.ok) {
        setEntry(res.data)
        fetchJournalSentiment(id)
        if (res.data.template_id) {
          const templateRes = await safeRequest(api.get<JournalTemplate>(`/journal-template/${res.data.template_id}`))
          if (templateRes.ok) {
            setTemplate(templateRes.data)
          } else {
            setTemplate(null)
          }
        }
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
    if (label === 'neutral') return <Meh className="h-4 w-4 text-yellow-500" />
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
        <Button variant="outline" onClick={() => navigate("/journals")} className="mb-6">
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
                    <span>{journalSentiment.sentiment_label} ({((journalSentiment.sentiment_score * 100).toFixed(2))}%)</span>
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">{entry.word_count} words</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {template && (
              <div className="mb-4 p-4 border rounded-md bg-muted/50">
                <h2 className="text-xl font-semibold mb-2">Template: {template.name}</h2>
                {template.prompts && template.prompts.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-1">Prompts:</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {template.prompts.map((prompt, index) => (
                        <li key={index}>{prompt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {template.benefits && template.benefits.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-1">Benefits:</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {template.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <CardTitle className="text-2xl font-bold mb-4 flex items-center gap-2">
            {keyThemes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-3">Key Themes:</h3>
                <div className="flex flex-wrap gap-2">
                  {keyThemes.map((theme, index) => (
                    <Tooltip.Provider key={index}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <Badge
                            variant="outline"
                            className={`h-10 font-extrabold bg-accent-background text-sm ${
                              theme.sentimentLabel === 'positive'
                                ? 'text-green-800'
                                : theme.sentimentLabel === 'negative'
                                ? 'text-red-800'
                                : 'text-yellow-800'
                            }`}
                          >
                            {theme.theme}
                          </Badge>
                        </Tooltip.Trigger>
                        <Tooltip.Content className='bg-muted p-2 rounded-md text-accent text-sm'>
                          <p>Sentiment: {theme.sentimentLabel}</p>
                          <p>Score: {(theme.averageSentiment * 100).toFixed(2)}</p>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  ))}
                </div>
              </div>
            )}
            </CardTitle>
            <h3 className="text-lg font-bold mb-3">Journal Entry:</h3>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
