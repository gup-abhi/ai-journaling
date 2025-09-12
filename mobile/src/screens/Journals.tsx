import React, { useEffect, useCallback, useRef, useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Alert, ScrollView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useThemeColors } from '../theme/colors'
import { useJournalStore } from '../stores/journal.store'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import Header from '../components/Header'

export default function Journals() {
  const {
    journalEntries,
    pagination,
    isLoading,
    isLoadingMore,
    isRetrying,
    error,
    retryFetch,
    clearError,
    fetchPaginatedJournalEntries,
    loadMoreJournalEntries,
    dateFilters,
    setDateFilters,
    clearDateFilters
  } = useJournalStore()
  const nav = useNavigation<any>()
  const colors = useThemeColors()
  const flatListRef = useRef<FlatList>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [filterType, setFilterType] = useState<'month' | 'year'>('month')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const hasFetchedRef = useRef(false)

  useEffect(() => {
    // Only fetch if we haven't fetched before or if the screen is coming back into focus
    if (!hasFetchedRef.current) {
      console.log('Journals screen: Initial fetch of paginated journal entries...')
      hasFetchedRef.current = true
      fetchPaginatedJournalEntries(1, 10)
    }
  }, []) // Empty dependency array to prevent infinite re-renders

  // Handle screen focus (when user navigates back to this screen)
  useFocusEffect(
    useCallback(() => {
      console.log('Journals screen: Screen focused')

      // Reset filters and fetch fresh data when returning to this screen
      const resetAndFetch = async () => {
        console.log('Journals screen: Resetting filters and fetching fresh data')

        // Clear any existing filters
        clearDateFilters()

        // Reset local state
        setSelectedMonth('')
        setSelectedYear('')
        setFilterType('month')
        setCurrentPage(1)

        // Fetch fresh data without filters
        await fetchPaginatedJournalEntries(1, 10)

        // Scroll to top when screen comes into focus
        const timer = setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: false })
          }
        }, 100)

        return () => clearTimeout(timer)
      }

      resetAndFetch()
    }, [clearDateFilters, fetchPaginatedJournalEntries])
  )

  const handleLoadMore = useCallback(() => {
    if (pagination?.hasNextPage && !isLoadingMore) {
      console.log('Journals screen: Loading more entries...')
      loadMoreJournalEntries()
    }
  }, [pagination, isLoadingMore, loadMoreJournalEntries])

  const handlePageChange = useCallback((page: number) => {
    console.log('Journals screen: Changing to page', page)
    setCurrentPage(page)
    fetchPaginatedJournalEntries(page, 10)
  }, [fetchPaginatedJournalEntries])

  const handleDateFilter = (filters: { month?: number; year?: number }) => {
    console.log('handleDateFilter called with filters:', filters)
    console.log('Type of filters.month:', typeof filters.month, 'Type of filters.year:', typeof filters.year)
    setDateFilters(filters)
    setShowDatePicker(false)
    setCurrentPage(1) // Reset to page 1 when applying filters
    // Fetch with new filters
    console.log('Calling fetchPaginatedJournalEntries with filters:', filters)
    setTimeout(() => fetchPaginatedJournalEntries(1, 10), 100)
  }

  const clearFilters = () => {
    clearDateFilters()
    setSelectedMonth('')
    setSelectedYear('')
    setCurrentPage(1)
    // Fetch all journals after clearing filters
    setTimeout(() => fetchPaginatedJournalEntries(1, 10), 100)
  }

  const applyFilter = () => {
    let filters: { month?: number; year?: number } = {}

    if (filterType === 'month' && selectedMonth && selectedYear) {
      const monthNum = parseInt(selectedMonth)
      const yearNum = parseInt(selectedYear)
      if (!isNaN(monthNum) && !isNaN(yearNum) && monthNum > 0 && yearNum > 0) {
        filters.month = monthNum
        filters.year = yearNum
        console.log('Applying month+year filter:', filters)
      }
    } else if (filterType === 'year' && selectedYear) {
      const yearNum = parseInt(selectedYear)
      if (!isNaN(yearNum) && yearNum > 0) {
        filters.year = yearNum
        console.log('Applying year filter:', filters)
      }
    }

    if (Object.keys(filters).length > 0) {
      console.log('Applying filters:', filters)
      handleDateFilter(filters)
    } else {
      console.log('No valid filters selected')
      Alert.alert('Invalid Filter', 'Please select appropriate filter values.')
    }
  }

  const getCurrentFilterText = () => {
    if (dateFilters?.month && dateFilters?.year) {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      return `Month: ${monthNames[dateFilters.month - 1]} ${dateFilters.year}`
    }
    if (dateFilters?.year) {
      return `Year: ${dateFilters.year}`
    }
    return 'All Journals'
  }

  const renderFooter = () => {
    if (!isLoadingMore) return null
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={[styles.footerText, { color: colors.muted }]}>Loading more...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Journals"
        rightButton={{
          icon: 'filter',
          onPress: () => setShowDatePicker(true),
          accessibilityLabel: 'Filter journals'
        }}
      />

      <View style={styles.headingContainer}>
        <Text style={[styles.mainHeading, { color: colors.text }]}>Your Journal Entries</Text>
        <Text style={[styles.subHeading, { color: colors.muted }]}>Reflect on your thoughts and track your progress</Text>

        {/* Active Filter Display */}
        {(dateFilters?.month || dateFilters?.year) && (
          <View style={styles.activeFilterContainer}>
            <Text style={[styles.activeFilterText, { color: colors.text }]}>
              Filtered by: {getCurrentFilterText()}
            </Text>
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={clearFilters}
            >
              <Feather name="x" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>Loading journals...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: '#ff6b6b' }]}>
            {error}
          </Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity
              style={[
                styles.retryButton,
                {
                  backgroundColor: isRetrying ? colors.muted : colors.accent,
                  opacity: isRetrying ? 0.6 : 1
                }
              ]}
              onPress={retryFetch}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <ActivityIndicator size="small" color={colors.accentText || '#fff'} />
              ) : (
                <Text style={[styles.retryButtonText, { color: colors.accentText || '#fff' }]}>
                  Retry
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: colors.muted }]}
              onPress={clearError}
              disabled={isRetrying}
            >
              <Text style={[styles.clearButtonText, { color: colors.muted }]}>
                Dismiss
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : journalEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            {dateFilters?.month || dateFilters?.year
              ? "No journal entries found for the selected filters. Try adjusting your filter criteria."
              : "No journal entries yet. Start by creating your first entry!"
            }
          </Text>
          {(dateFilters?.month || dateFilters?.year) && (
            <TouchableOpacity
              style={[styles.clearFiltersButton, { borderColor: colors.accent, marginTop: 20 }]}
              onPress={clearFilters}
            >
              <Text style={[styles.clearFiltersButtonText, { color: colors.accent }]}>
                Clear Filters
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          style={styles.flatList}
          data={journalEntries}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => nav.navigate('JournalView', { id: item._id })}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={[styles.viewBtnAbsolute, { borderColor: colors.accent, backgroundColor: colors.accentBg, paddingVertical: 4, paddingHorizontal: 8, zIndex: 10, elevation: 2 }]}
              >
                <Feather name="eye" size={14} color={colors.accentText} />
              </TouchableOpacity>
              <Text style={[styles.date, { color: colors.muted }]}>{new Date(item.entry_date).toDateString()}</Text>
              <Text numberOfLines={4} style={{ color: colors.text }}>{item.content}</Text>
            </View>
          )}
        />
      )}

      {/* Date Filter Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Journals</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Filter Type Selection */}
            <View style={styles.filterTypeContainer}>
              <Text style={[styles.filterTypeLabel, { color: colors.text }]}>Filter Type:</Text>
              <View style={styles.filterTypeButtons}>
                {[
                  { key: 'month', label: 'Month' },
                  { key: 'year', label: 'Year' }
                ].map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.filterTypeButton,
                      {
                        backgroundColor: filterType === type.key ? colors.accent : colors.muted,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => {
                      setFilterType(type.key as 'month' | 'year');
                      // Reset selections when switching filter types
                      if (type.key === 'year') {
                        // Don't reset selectedYear when switching to year filter
                        setSelectedMonth(''); // Reset month when switching to year-only
                      }
                      if (type.key === 'month') {
                        // Don't reset selectedMonth when switching to month filter
                        // Keep selectedYear for month+year filtering
                      }
                    }}
                  >
                    <Text style={[
                      styles.filterTypeButtonText,
                      { color: filterType === type.key ? colors.accentText : colors.text }
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Month and Year Selection */}
            {filterType === 'month' && (
              <View style={styles.monthYearContainer}>
                <View style={styles.pickerRow}>
                  <Text style={[styles.pickerLabel, { color: colors.text }]}>Month:</Text>
                  <TouchableOpacity
                    style={[styles.pickerButton, { borderColor: colors.border }]}
                    onPress={() => setShowMonthPicker(true)}
                  >
                    <Text style={[styles.pickerButtonText, { color: colors.text }]}>
                      {selectedMonth ? [
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                      ][parseInt(selectedMonth) - 1] : 'Select Month'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.pickerRow}>
                  <Text style={[styles.pickerLabel, { color: colors.text }]}>Year:</Text>
                  <TouchableOpacity
                    style={[styles.pickerButton, { borderColor: colors.border }]}
                    onPress={() => setShowYearPicker(true)}
                  >
                  <Text style={[styles.pickerButtonText, { color: colors.text }]}>
                    {selectedYear || 'Select Year'}
                  </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Year Only Selection */}
            {filterType === 'year' && (
              <View style={styles.yearContainer}>
                <View style={styles.pickerRow}>
                  <Text style={[styles.pickerLabel, { color: colors.text }]}>Year:</Text>
                  <TouchableOpacity
                    style={[styles.pickerButton, { borderColor: colors.border }]}
                    onPress={() => setShowYearPicker(true)}
                  >
                    <Text style={[styles.pickerButtonText, { color: colors.text }]}>
                      {selectedYear || 'Select Year'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton, { backgroundColor: colors.accent }]}
                onPress={applyFilter}
              >
                <Text style={[styles.modalButtonText, { color: colors.accentText }]}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerModalContent, { backgroundColor: colors.cardBg }]}>
            <View style={styles.pickerModalHeader}>
              <Text style={[styles.pickerModalTitle, { color: colors.text }]}>Select Month</Text>
              <TouchableOpacity
                onPress={() => setShowMonthPicker(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.pickerScrollView}>
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((monthName, index) => (
                <TouchableOpacity
                  key={monthName}
                  style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setSelectedMonth((index + 1).toString())
                    setShowMonthPicker(false)
                  }}
                >
                  <Text style={[styles.pickerItemText, { color: colors.text }]}>
                    {monthName}
                  </Text>
                  {selectedMonth === (index + 1).toString() && (
                    <Feather name="check" size={20} color={colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowYearPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerModalContent, { backgroundColor: colors.cardBg }]}>
            <View style={styles.pickerModalHeader}>
              <Text style={[styles.pickerModalTitle, { color: colors.text }]}>Select Year</Text>
              <TouchableOpacity
                onPress={() => setShowYearPicker(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.pickerScrollView}>
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - i
                return (
                  <TouchableOpacity
                    key={year}
                    style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setSelectedYear(year.toString())
                      setShowYearPicker(false)
                    }}
                  >
                    <Text style={[styles.pickerItemText, { color: colors.text }]}>
                      {year}
                    </Text>
                    {selectedYear === year.toString() && (
                      <Feather name="check" size={20} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 48 
  },
  headingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  flatList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: { 
    backgroundColor: '#f2f2f2', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 12, 
    borderWidth: 1, 
    position: 'relative' 
  },
  date: { 
    fontWeight: '600', 
    marginBottom: 4 
  },
  viewBtnAbsolute: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  clearFiltersButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  clearFiltersButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
  },
  filterButton: {
    padding: 8,
  },
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  activeFilterText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  clearFilterButton: {
    padding: 4,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  filterTypeContainer: {
    marginBottom: 20,
  },
  filterTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  calendarContainer: {
    marginBottom: 20,
  },
  monthYearContainer: {
    marginBottom: 20,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    width: 60,
  },
  pickerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  pickerButtonText: {
    fontSize: 16,
  },
  yearContainer: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  applyButton: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pickerScrollView: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  pickerItemText: {
    fontSize: 18,
  },
})


