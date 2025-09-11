export type JournalEntry = {
  _id: string
  content: string
  entry_date: string
  word_count: number
}

export type PaginationMeta = {
  currentPage: number
  totalPages: number
  totalEntries: number
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
}

export type PaginatedJournalResponse = {
  entries: JournalEntry[]
  pagination: PaginationMeta
}
