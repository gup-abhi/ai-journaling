import React, { useEffect, useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native'
import { useThemeColors } from '../theme/colors'
import { useJournalStore } from '../stores/journal.store'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { JournalTemplate } from '../types/JournalTemplate'

export default function JournalTemplates() {
  const colors = useThemeColors()
  const navigation = useNavigation()
  const [isLoading, setIsLoading] = useState(true)
  
  const { 
    journalTemplates, 
    fetchJournalTemplates, 
    setSelectedTemplate 
  } = useJournalStore()

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true)
      await fetchJournalTemplates()
      setIsLoading(false)
    }
    loadTemplates()
  }, [fetchJournalTemplates])

  const handleUseTemplate = (template: JournalTemplate) => {
    setSelectedTemplate(template)
    navigation.navigate('NewJournalEntry' as never)
  }

  const TemplateCard = ({ template }: { template: JournalTemplate }) => (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{template.name}</Text>
        <Text style={[styles.cardDescription, { color: colors.muted }]}>
          {template.description}
        </Text>
      </View>

      <View style={styles.cardContent}>
        {template.prompts && template.prompts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.accent }]}>Prompts</Text>
            {template.prompts.map((prompt, index) => (
              <Text key={index} style={[styles.promptText, { color: colors.muted }]}>
                • {prompt}
              </Text>
            ))}
          </View>
        )}

        {template.benefits && template.benefits.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.accent }]}>Benefits</Text>
            {template.benefits.map((benefit, index) => (
              <Text key={index} style={[styles.benefitText, { color: colors.muted }]}>
                • {benefit}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={[styles.useButton, { backgroundColor: colors.accent }]}
          onPress={() => handleUseTemplate(template)}
        >
          <Text style={[styles.useButtonText, { color: colors.background }]}>
            Use Template
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading templates...
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Journal Templates</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {journalTemplates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={64} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Templates Available
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.muted }]}>
              Templates will appear here when they become available.
            </Text>
          </View>
        ) : (
          journalTemplates.map((template) => (
            <TemplateCard key={template._id} template={template} />
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
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
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  promptText: {
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 8,
  },
  benefitText: {
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 8,
  },
  cardFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  useButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  useButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
})
