import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Dimensions,
  ActivityIndicator,
  TextInput,
  FlatList
} from 'react-native'
import { useThemeColors } from '../theme/colors'
import { type TimelineEntry } from '../types/Timeline.type'

const { width: screenWidth } = Dimensions.get('window')

interface TimelineProps {
  entries: TimelineEntry[]
  isLoading?: boolean
  onEntryPress?: (entry: TimelineEntry) => void
  selectedTheme?: string
  onThemeFilter?: (theme: string | null) => void
}

export default function Timeline({ 
  entries, 
  isLoading = false, 
  onEntryPress,
  selectedTheme,
  onThemeFilter 
}: TimelineProps) {
  const colors = useThemeColors()
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '#10B981' // green
      case 'negative':
        return '#EF4444' // red
      case 'mixed':
        return '#F59E0B' // amber
      case 'neutral':
      default:
        return '#6B7280' // gray
    }
  }

  const getSentimentBackgroundColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '#10B98120' // green with opacity
      case 'negative':
        return '#EF444420' // red with opacity
      case 'mixed':
        return '#F59E0B20' // amber with opacity
      case 'neutral':
      default:
        return '#6B728020' // gray with opacity
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleEntryPress = (entry: TimelineEntry) => {
    setSelectedEntry(entry)
    onEntryPress?.(entry)
  }

  const closeModal = () => {
    setSelectedEntry(null)
  }

  const getAvailableThemes = () => {
    const themes = new Set<string>()
    entries.forEach(entry => {
      entry.themes.forEach(theme => {
        themes.add(theme.theme)
      })
    })
    return Array.from(themes).sort()
  }

  const getFilteredThemes = () => {
    const allThemes = getAvailableThemes()
    if (!searchQuery.trim()) return allThemes
    return allThemes.filter(theme => 
      theme.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const handleThemeSelect = (theme: string | null) => {
    onThemeFilter?.(theme)
    setIsDropdownOpen(false)
    setSearchQuery('')
  }

  // Close dropdown when search query is cleared
  useEffect(() => {
    if (!searchQuery.trim() && isDropdownOpen) {
      // Keep dropdown open when search is cleared, but reset to show all themes
    }
  }, [searchQuery, isDropdownOpen])

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading timeline...</Text>
      </View>
    )
  }

  if (entries.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.emptyText, { color: colors.muted }]}>No journal entries found</Text>
        <Text style={[styles.emptySubtext, { color: colors.muted }]}>
          Start journaling to see your timeline
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Theme Filter Button */}
      {onThemeFilter && (
        <View style={styles.filterContainer}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Filter by theme:</Text>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
              }
            ]}
            onPress={() => setIsDropdownOpen(true)}
          >
            <Text style={[styles.filterButtonText, { color: colors.text }]}>
              {selectedTheme || 'All Themes'}
            </Text>
            <Text style={[styles.filterArrow, { color: colors.muted }]}>
              ▼
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Timeline */}
      <FlatList
        style={styles.timelineContainer}
        data={entries}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: entry, index }) => (
          <View style={styles.timelineItem}>
            {/* Timeline Line */}
            {index < entries.length - 1 && (
              <View 
                style={[
                  styles.timelineLine, 
                  { backgroundColor: colors.border }
                ]} 
              />
            )}
            
            {/* Entry Marker */}
            <TouchableOpacity
              style={[
                styles.marker,
                {
                  backgroundColor: getSentimentColor(entry.sentiment.overall),
                  borderColor: colors.background,
                }
              ]}
              onPress={() => handleEntryPress(entry)}
              activeOpacity={0.7}
            >
              <View style={[styles.markerInner, { backgroundColor: colors.background }]} />
            </TouchableOpacity>

            {/* Entry Content */}
            <TouchableOpacity
              style={[
                styles.entryContent,
                {
                  backgroundColor: getSentimentBackgroundColor(entry.sentiment.overall),
                  borderColor: getSentimentColor(entry.sentiment.overall),
                }
              ]}
              onPress={() => handleEntryPress(entry)}
              activeOpacity={0.7}
            >
              <View style={styles.entryHeader}>
                <Text style={[styles.entryDate, { color: colors.text }]}>
                  {formatDate(entry.date)}
                </Text>
                <Text style={[styles.entryTime, { color: colors.muted }]}>
                  {formatTime(entry.date)}
                </Text>
              </View>
              
              <Text 
                style={[styles.entryPreview, { color: colors.text }]}
                numberOfLines={2}
              >
                {entry.content}
              </Text>
              
              <View style={styles.entryFooter}>
                <Text style={[styles.wordCount, { color: colors.muted }]}>
                  {entry.wordCount} words
                </Text>
                <Text style={[styles.sentimentLabel, { color: getSentimentColor(entry.sentiment.overall) }]}>
                  {entry.sentiment.overall}
                </Text>
              </View>

              {entry.themes.length > 0 && (
                <View style={styles.themesContainer}>
                  {entry.themes.slice(0, 2).map((theme, themeIndex) => (
                    <View
                      key={themeIndex}
                      style={[
                        styles.themeTag,
                        {
                          backgroundColor: getSentimentBackgroundColor(theme.sentiment_towards_theme),
                          borderColor: getSentimentColor(theme.sentiment_towards_theme),
                        }
                      ]}
                    >
                      <Text
                        style={[
                          styles.themeTagText,
                          { color: getSentimentColor(theme.sentiment_towards_theme) }
                        ]}
                      >
                        {theme.theme}
                      </Text>
                    </View>
                  ))}
                  {entry.themes.length > 2 && (
                    <Text style={[styles.moreThemes, { color: colors.muted }]}>
                      +{entry.themes.length - 2} more
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Entry Detail Modal */}
      <Modal
        visible={!!selectedEntry}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        {selectedEntry && (
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Journal Entry
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: colors.accent }]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.modalEntryHeader}>
                <Text style={[styles.modalDate, { color: colors.text }]}>
                  {formatDate(selectedEntry.date)}
                </Text>
                <Text style={[styles.modalTime, { color: colors.muted }]}>
                  {formatTime(selectedEntry.date)}
                </Text>
                <View style={styles.modalSentiment}>
                  <Text style={[styles.modalSentimentLabel, { color: colors.text }]}>
                    Sentiment:
                  </Text>
                  <Text style={[styles.modalSentimentValue, { color: getSentimentColor(selectedEntry.sentiment.overall) }]}>
                    {selectedEntry.sentiment.overall}
                  </Text>
                </View>
              </View>

              <View style={[styles.modalContentSection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.modalSectionTitle, { color: colors.accent }]}>
                  Content
                </Text>
                <Text style={[styles.modalContentText, { color: colors.text }]}>
                  {selectedEntry.content}
                </Text>
                <Text style={[styles.modalWordCount, { color: colors.muted }]}>
                  {selectedEntry.wordCount} words
                </Text>
              </View>

              {selectedEntry.summary && (
                <View style={[styles.modalContentSection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.modalSectionTitle, { color: colors.accent }]}>
                    AI Summary
                  </Text>
                  <Text style={[styles.modalContentText, { color: colors.text }]}>
                    {selectedEntry.summary}
                  </Text>
                </View>
              )}

              {selectedEntry.themes.length > 0 && (
                <View style={[styles.modalContentSection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.modalSectionTitle, { color: colors.accent }]}>
                    Themes
                  </Text>
                  <View style={styles.modalThemesContainer}>
                    {selectedEntry.themes.map((theme, index) => (
                      <View
                        key={index}
                        style={[
                          styles.modalThemeTag,
                          {
                            backgroundColor: getSentimentBackgroundColor(theme.sentiment_towards_theme),
                            borderColor: getSentimentColor(theme.sentiment_towards_theme),
                          }
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalThemeTagText,
                            { color: getSentimentColor(theme.sentiment_towards_theme) }
                          ]}
                        >
                          {theme.theme}
                        </Text>
                        {theme.action_taken_or_planned && (
                          <Text style={[styles.modalThemeAction, { color: colors.muted }]}>
                            {theme.action_taken_or_planned}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {selectedEntry.significantEvents.length > 0 && (
                <View style={[styles.modalContentSection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.modalSectionTitle, { color: colors.accent }]}>
                    Key Learnings
                  </Text>
                  <View style={styles.keyLearningsContainer}>
                    {selectedEntry.significantEvents.map((event, index) => (
                      <View key={index} style={styles.keyLearningItem}>
                        <Text style={[styles.keyLearningBullet, { color: colors.accent }]}>•</Text>
                        <Text style={[styles.keyLearningText, { color: colors.text }]}>
                          {event}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Theme Selection Modal */}
      <Modal
        visible={isDropdownOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Theme Filter
            </Text>
            <TouchableOpacity onPress={() => setIsDropdownOpen(false)} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.accent }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                  color: colors.text,
                }
              ]}
              placeholder="Search themes..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            
            <ScrollView style={styles.themeList} showsVerticalScrollIndicator={true}>
              <TouchableOpacity
                style={[
                  styles.themeItem,
                  {
                    backgroundColor: !selectedTheme ? colors.accent + '20' : 'transparent',
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => handleThemeSelect(null)}
              >
                <Text
                  style={[
                    styles.themeItemText,
                    {
                      color: !selectedTheme ? colors.accent : colors.text,
                      fontWeight: !selectedTheme ? '600' : '400',
                    }
                  ]}
                >
                  All Themes
                </Text>
              </TouchableOpacity>
              
              {getFilteredThemes().map((theme) => (
                <TouchableOpacity
                  key={theme}
                  style={[
                    styles.themeItem,
                    {
                      backgroundColor: selectedTheme === theme ? colors.accent + '20' : 'transparent',
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => handleThemeSelect(theme)}
                >
                  <Text
                    style={[
                      styles.themeItemText,
                      {
                        color: selectedTheme === theme ? colors.accent : colors.text,
                        fontWeight: selectedTheme === theme ? '600' : '400',
                      }
                    ]}
                  >
                    {theme}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {getFilteredThemes().length === 0 && searchQuery.trim() && (
                <View style={styles.noResultsContainer}>
                  <Text style={[styles.noResultsText, { color: colors.muted }]}>
                    No themes found matching "{searchQuery}"
                  </Text>
                </View>
              )}
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
  },
  loadingContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  filterArrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 16,
  },
  themeList: {
    flex: 1,
  },
  themeItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  themeItemText: {
    fontSize: 16,
  },
  noResultsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  timelineContainer: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingBottom: 16,
  },
  timelineLine: {
    position: 'absolute',
    left: 29,
    top: 20,
    width: 2,
    height: '100%',
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    zIndex: 1,
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  entryContent: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  entryTime: {
    fontSize: 12,
  },
  entryPreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wordCount: {
    fontSize: 12,
  },
  sentimentLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  themeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreThemes: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 50,
    flexGrow: 1,
  },
  modalEntryHeader: {
    marginBottom: 16,
  },
  modalDate: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalTime: {
    fontSize: 14,
    marginBottom: 8,
  },
  modalSentiment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalSentimentLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  modalSentimentValue: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  modalContentSection: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalContentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  modalWordCount: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  modalThemesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalThemeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 4,
  },
  modalThemeTagText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  modalThemeAction: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  modalEventText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  keyLearningsContainer: {
    marginTop: 8,
  },
  keyLearningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  keyLearningBullet: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    marginTop: 2,
  },
  keyLearningText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
})
