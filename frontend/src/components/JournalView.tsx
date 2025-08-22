import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, safeRequest } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Calendar, FileText } from 'lucide-react'
import moment from 'moment'

type JournalEntry = {
  _id: string
  content: string
  entry_date: string
  word_count: number
}

export function JournalView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEntry = async () => {
      setIsLoading(true)
      const res = await safeRequest(api.get<JournalEntry>(`/journal/${id}`))
      if (res.ok) {
        setEntry(res.data)
      } else {
        setError(res.error)
      }
      setIsLoading(false)
    }
    fetchEntry()
  }, [id])

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading journal entry...</div>
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
              <span className="text-sm text-muted-foreground">{entry.word_count} words</span>
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
