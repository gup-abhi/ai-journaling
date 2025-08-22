import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, safeRequest } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Calendar, FileText, Eye } from 'lucide-react'
import { Button } from './ui/button'

type JournalEntry = {
  _id: string
  content: string
  entry_date: string
  word_count: number
}

export function Journals() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchEntries = async () => {
      setIsLoading(true)
      const res = await safeRequest(api.get<{ entries: JournalEntry[] }>('/journal'))
      if (!mounted) return
      if (!res.ok) {
        setError(res.error)
        setIsLoading(false)
        return
      }
      setEntries(res.data.entries || [])
      setIsLoading(false)
    }
    fetchEntries()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex justify-between items-center relative">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Journals</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Link to="/journals/new">
              <Button>New Entry</Button>
            </Link>
          </div>
        </div>

        {isLoading && (
          <div className="text-sm text-muted-foreground">Loading entries...</div>
        )}
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        {!isLoading && !error && entries.length === 0 && (
          <div className="text-sm text-muted-foreground">No journal entries yet. Start by creating your first entry!</div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => {
            const dateStr = new Date(entry.entry_date).toLocaleString()
            const preview = entry.content.length > 160 ? entry.content.slice(0, 160) + '…' : entry.content
            return (
              <Card key={entry._id} className="group hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{dateStr}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{entry.word_count} words</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Entry
                  </CardTitle>
                  <p className="text-sm text-foreground leading-relaxed line-clamp-4">
                    {preview}
                  </p>
                  <div className="mt-4 flex items-center justify-end">
                    <Link to={`/journals/${entry._id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
