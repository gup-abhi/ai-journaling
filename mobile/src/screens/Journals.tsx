import React, { useEffect, useCallback, useRef } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useThemeColors } from '../theme/colors'
import { useJournalStore } from '../stores/journal.store'
import { useNavigation, useFocusEffect } from '@react-navigation/native'

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
    loadMoreJournalEntries
  } = useJournalStore()
  const nav = useNavigation<any>()
  const colors = useThemeColors()
  const flatListRef = useRef<FlatList>(null)

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

      // Scroll to top when screen comes into focus
      const timer = setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: false })
        }
      }, 100)

      return () => clearTimeout(timer)
    }, [])
  )

  const handleLoadMore = useCallback(() => {
    if (pagination?.hasNextPage && !isLoadingMore) {
      console.log('Journals screen: Loading more entries...')
      loadMoreJournalEntries()
    }
  }, [pagination, isLoadingMore, loadMoreJournalEntries])

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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => nav.goBack()}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Journals</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.headingContainer}>
        <Text style={[styles.mainHeading, { color: colors.text }]}>Your Journal Entries</Text>
        <Text style={[styles.subHeading, { color: colors.muted }]}>Reflect on your thoughts and track your progress</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>Loading journals...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error || '#ff6b6b' }]}>
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
            No journal entries yet. Start by creating your first entry!
          </Text>
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 48 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700' 
  },
  placeholder: {
    width: 40,
  },
  headingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: 24,
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
})


