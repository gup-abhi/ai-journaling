import React, { useEffect, useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  FlatList,
  RefreshControl 
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { useThemeColors } from '../theme/colors'
import { useToast } from '../contexts/ToastContext'
import Header from '../components/Header'
import { api, safeRequest } from '../lib/api'

interface ThemeEntry {
  id: string
  content: string
  entry_date: string
  word_count: number
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral' | 'mixed'
    score: number
    emotions: Array<{
      emotion: string
      intensity: 'low' | 'medium' | 'high'
    }>
  }
  matched_theme: {
    theme: string
    sentiment_towards_theme: string
    action_taken_or_planned?: string
  }
  all_themes: Array<{
    theme: string
    sentiment_towards_theme: string
    action_taken_or_planned?: string
  }>
  summary: string
  key_learnings: string[]
}

interface ThemeDetailData {
  entries: ThemeEntry[]
  theme: string
  period: string
  pagination: {
    currentPage: number
    totalPages: number
    totalEntries: number
    hasNextPage: boolean
    hasPrevPage: boolean
    limit: number
  }
  dateRange?: {
    start: string
    end: string
  }
}

export default function ThemeDetail() {
  const colors = useThemeColors()
  const { showToast } = useToast()
  const navigation = useNavigation()
  const route = useRoute()
  const { theme, period = 'all' } = route.params as { theme: string; period?: string }
  
  const [data, setData] = useState<ThemeDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchThemeEntries = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const result = await safeRequest(
        api.get(`/journal/by-theme?theme=${encodeURIComponent(theme)}&period=${period}&page=${pageNum}&limit=10`)
      )

      if (result.ok) {
        if (pageNum === 1) {
          setData(result.data)
          setPage(1)
        } else {
          setData(prev => ({
            ...result.data,
            entries: [...(prev?.entries || []), ...result.data.entries]
          }))
        }
      } else {
        console.error('Failed to fetch theme entries:', result.error)
        showToast('Failed to load theme entries. Please try again.', 'error')
      }
    } catch (error) {
      console.error('Error fetching theme entries:', error)
      showToast('Failed to load theme entries. Please try again.', 'error')
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchThemeEntries(1, true)
  }

  const loadMore = () => {
    if (!loadingMore && data?.pagination.hasNextPage) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchThemeEntries(nextPage)
    }
  }

  useEffect(() => {
    fetchThemeEntries()
  }, [theme, period])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '#10B981'
      case 'negative':
        return '#EF4444'
      case 'mixed':
        return '#F59E0B'
      case 'neutral':
      default:
        return '#EAB308'
    }
  }

  const getSentimentBackgroundColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '#10B98120'
      case 'negative':
        return '#EF444420'
      case 'mixed':
        return '#F59E0B20'
      case 'neutral':
      default:
        return '#EAB30820'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderEntry = ({ item }: { item: ThemeEntry }) => (
    <View style={[styles.entryCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={styles.entryHeader}>
        <Text style={[styles.entryDate, { color: colors.muted }]}>
          {formatDate(item.entry_date)}
        </Text>
        <View style={[
          styles.sentimentBadge,
          { 
            backgroundColor: getSentimentBackgroundColor(item.sentiment.overall),
            borderColor: getSentimentColor(item.sentiment.overall)
          }
        ]}>
          <Text style={[styles.sentimentText, { color: getSentimentColor(item.sentiment.overall) }]}>
            {item.sentiment.overall}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.entryContent, { color: colors.text }]} numberOfLines={4}>
        {item.content}
      </Text>
      
      <View style={styles.entryFooter}>
        <Text style={[styles.wordCount, { color: colors.muted }]}>
          {item.word_count} words
        </Text>
        <TouchableOpacity
          style={[styles.readMoreButton, { borderColor: colors.accent }]}
          onPress={() => navigation.navigate('JournalView' as never, { id: item.id } as never)}
        >
          <Text style={[styles.readMoreText, { color: colors.accent }]}>
            Read More
          </Text>
          <Feather name="arrow-right" size={14} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {item.summary && (
        <View style={[styles.summaryContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.summaryTitle, { color: colors.accent }]}>Summary</Text>
          <Text style={[styles.summaryText, { color: colors.text }]}>
            {item.summary}
          </Text>
        </View>
      )}

      {item.key_learnings.length > 0 && (
        <View style={[styles.learningsContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.learningsTitle, { color: colors.accent }]}>Key Learnings</Text>
          {item.key_learnings.map((learning, index) => (
            <Text key={index} style={[styles.learningItem, { color: colors.text }]}>
              • {learning}
            </Text>
          ))}
        </View>
      )}
    </View>
  )

  const renderHeader = () => (
    <View style={[styles.headerCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <Text style={[styles.themeTitle, { color: colors.accent }]}>
        "{theme}"
      </Text>
      <Text style={[styles.themeSubtitle, { color: colors.muted }]}>
        {data?.pagination.totalEntries || 0} journal entries
        {data?.dateRange && (
          <Text style={{ color: colors.muted }}>
            {' • '}{period === 'all' ? 'All time' : period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        )}
      </Text>
      {data?.dateRange && (
        <Text style={[styles.dateRange, { color: colors.muted }]}>
          {formatDate(data.dateRange.start)} - {formatDate(data.dateRange.end)}
        </Text>
      )}
    </View>
  )

  const renderFooter = () => {
    if (!loadingMore) return null
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={[styles.footerText, { color: colors.muted }]}>Loading more entries...</Text>
      </View>
    )
  }

  if (loading && !data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Theme Details" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading theme entries...
          </Text>
        </View>
      </View>
    )
  }

  if (!data || data.entries.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Theme Details" showBackButton={true} />
        <View style={styles.emptyContainer}>
          <Feather name="book-open" size={48} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No entries found
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            No journal entries found for the theme "{theme}"
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Theme Details" showBackButton={true} />
      
      <FlatList
        data={data.entries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48
  },
  contentContainer: {
    padding: 16,
    paddingTop: 8,
    gap: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24
  },
  headerCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center'
  },
  themeTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8
  },
  themeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4
  },
  dateRange: {
    fontSize: 14,
    textAlign: 'center'
  },
  entryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '500'
  },
  sentimentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  entryContent: {
    fontSize: 16,
    lineHeight: 24
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  wordCount: {
    fontSize: 12,
    fontWeight: '500'
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '600'
  },
  summaryContainer: {
    borderRadius: 8,
    padding: 12,
    gap: 8
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600'
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20
  },
  learningsContainer: {
    borderRadius: 8,
    padding: 12,
    gap: 8
  },
  learningsTitle: {
    fontSize: 14,
    fontWeight: '600'
  },
  learningItem: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500'
  }
})
