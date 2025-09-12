import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, FileText, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/Loader'
import { DateFilter } from '@/components/ui/calendar'
import { useJournalStore } from '@/stores/journal.store'

export function Journals() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentPage, setCurrentPage] = useState(1)
  const {
    journalEntries,
    pagination,
    isLoading,
    dateFilters,
    fetchPaginatedJournalEntries,
    setDateFilters,
    clearDateFilters
  } = useJournalStore()

  // Reset filters and pagination when component first mounts
  useEffect(() => {
    console.log('Journals page: Component mounted, resetting to default state')
    clearDateFilters()
    setCurrentPage(1)
    fetchPaginatedJournalEntries(1, 9)
  }, []) // Empty dependency array - runs only on mount

  useEffect(() => {
    // Only fetch when currentPage changes (not on initial mount)
    if (currentPage > 1) {
      fetchPaginatedJournalEntries(currentPage, 9)
    }
  }, [currentPage])

  // Handle navigation back to this page
  useEffect(() => {
    console.log('Journals page: Location changed to:', location.pathname)
    // Reset to default state when navigating to this page
    if (location.pathname === '/journals') {
      console.log('Journals page: Resetting filters and pagination on navigation')
      clearDateFilters()
      setCurrentPage(1)
      fetchPaginatedJournalEntries(1, 9)
    }
  }, [location.pathname, clearDateFilters, fetchPaginatedJournalEntries])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleDateFilterChange = (filters: { month?: number; year?: number }) => {
    setDateFilters(filters)
    setCurrentPage(1) // Reset to first page when filters change
    // Fetch with new filters
    fetchPaginatedJournalEntries(1, 9)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Journals</h1>
            </div>
            <div className="flex gap-2">
              <DateFilter
                onDateSelect={handleDateFilterChange}
                currentFilters={dateFilters}
              />
              <Button variant="outline" onClick={() => navigate("/dashboard")}>Go Back</Button>
              <Button onClick={() => navigate('/journal/new')}>New Entry</Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(dateFilters.month || dateFilters.year) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtered by:</span>
              {dateFilters.month && dateFilters.year && (
                <Badge variant="secondary">
                  Month: {new Date(dateFilters.year, dateFilters.month - 1).toLocaleString('default', { month: 'long' })} {dateFilters.year}
                </Badge>
              )}
              {dateFilters.year && !dateFilters.month && (
                <Badge variant="secondary">
                  Year: {dateFilters.year}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearDateFilters()
                  setCurrentPage(1)
                  // Fetch all journals after clearing filters
                  fetchPaginatedJournalEntries(1, 9)
                }}
                className="h-6 px-2 text-xs"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {isLoading && (
          <Loader />
        )}

        {!isLoading && journalEntries.length === 0 && (
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground mb-4">
              {dateFilters?.month || dateFilters?.year
                ? "No journal entries found for the selected filters. Try adjusting your filter criteria or clear the filters to see all entries."
                : "No journal entries yet. Start by creating your first entry!"
              }
            </div>
            {(dateFilters?.month || dateFilters?.year) && (
              <Button
                variant="outline"
                onClick={() => {
                  clearDateFilters()
                  setCurrentPage(1)
                  fetchPaginatedJournalEntries(1, 9)
                }}
                className="text-sm mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
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
