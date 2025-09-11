import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, FileText, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/Loader'
import { useJournalStore } from '@/stores/journal.store'

export function Journals() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const { journalEntries, pagination, isLoading, fetchPaginatedJournalEntries } = useJournalStore()

  useEffect(() => {
    fetchPaginatedJournalEntries(currentPage, 9) // 9 entries per page for 3x3 grid
  }, [currentPage, fetchPaginatedJournalEntries])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex justify-between items-center relative">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Journals</h1>
          </div>
          <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>Go Back</Button>
              <Button onClick={() => navigate('/journal/new')}>New Entry</Button>
          </div>
        </div>

        {isLoading && (
          <Loader />
        )}

        {!isLoading && journalEntries.length === 0 && (
          <div className="text-sm text-muted-foreground">No journal entries yet. Start by creating your first entry!</div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {journalEntries.map((entry) => {
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

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage || isLoading}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <span className="text-sm text-muted-foreground">
                ({pagination.totalEntries} total entries)
              </span>
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage || isLoading}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
