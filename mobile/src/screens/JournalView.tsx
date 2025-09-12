import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useThemeColors } from '../theme/colors'
import { useRoute, useNavigation } from '@react-navigation/native'
import { api, safeRequest } from '../lib/api'
import { JournalTemplate } from '../types/JournalTemplate'

type JournalEntry = {
  _id: string
  content: string
  entry_date: string
  word_count?: number
  template_id?: string
}

type Trend = any

export default function JournalView() {
  const route = useRoute<any>()
  const nav = useNavigation<any>()
  const { id } = route.params as { id: string }
  const colors = useThemeColors()
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [trend, setTrend] = useState<Trend | null>(null)
  const [noInsights, setNoInsights] = useState(false)
  const [template, setTemplate] = useState<JournalTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const res = await safeRequest(api.get<JournalEntry>(`/journal/${id}`))
      if (res.ok) {
        setEntry(res.data)
        // Fetch template if template_id exists
        if (res.data.template_id) {
          const templateRes = await safeRequest(api.get<JournalTemplate>(`/journal-template/${res.data.template_id}`))
          if (templateRes.ok) {
            setTemplate(templateRes.data)
          } else {
            setTemplate(null)
          }
        }
      }
      const t = await safeRequest(api.get(`/ai-insights/trends/journal/${id}`))
      if (t.ok) setTrend(t.data as any)
      else setNoInsights(true)
      setIsLoading(false)
    }
    load()
  }, [id])

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading journal entry...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}> 
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => nav.goBack()} style={[styles.backBtn, { borderColor: colors.accent, backgroundColor: colors.accentBg }]}>
          <Text style={[styles.backText, { color: colors.accentText }]}>Back</Text>
        </TouchableOpacity>

        {entry && (
          <View style={[styles.dateContainer, { borderColor: colors.border, backgroundColor: colors.cardBg }]}>
            <Text style={[styles.headerDate, { color: colors.text }]}>
              {new Date(entry.entry_date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            <Text style={[styles.headerTime, { color: colors.muted }]}>
              {new Date(entry.entry_date).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </Text>
          </View>
        )}
      </View>

      {entry && (
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.date, { color: colors.muted }]}>{new Date(entry.entry_date).toLocaleString()}</Text>
          {!!entry.word_count && <Text style={[styles.muted, { color: colors.muted }]}>{entry.word_count} words</Text>}
          
          {template && (
            <View style={[styles.templateSection, { borderColor: colors.border, backgroundColor: colors.mutedBg }]}>
              <Text style={[styles.templateTitle, { color: colors.text }]}>Template Used: {template.name}</Text>
            </View>
          )}
          
          <Text style={[styles.journalEntryTitle, { color: colors.accent }]}>Journal Entry:</Text>
          <Text style={[styles.content, { color: colors.text }]}>{entry.content}</Text>
        </View>
      )}

      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.cardBg }]}> 
        <Text style={[styles.sectionTitle, { color: colors.accent }]}>AI Insights</Text>
        {noInsights && <Text style={[styles.muted, { color: colors.muted }]}>No AI insights available for this entry yet.</Text>}
        {trend && trend.summary && (
          <View style={{ marginTop: 8 }}>
            <Text style={[styles.subheading, { color: colors.accent }]}>Summarized:</Text>
            <Text style={[styles.muted, { color: colors.muted }]}>{trend.summary}</Text>
          </View>
        )}
        {trend && trend.sentiment && trend.sentiment.acknowledgement && (
          <View style={{ marginTop: 8 }}>
            <Text style={[styles.subheading, { color: colors.accent }]}>Compassionate Note:</Text>
            <Text style={[styles.muted, { color: colors.muted }]}>{trend.sentiment.acknowledgement}</Text>
          </View>
        )}
        {trend && trend.sentiment && Array.isArray(trend.sentiment.emotions) && trend.sentiment.emotions.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.subheading, { color: colors.accent }]}>Emotions:</Text>
            <View style={{ marginTop: 6, marginLeft: 12 }}>
              {trend.sentiment.emotions.map((emotion: any, idx: number) => (
                <View key={idx} style={{ marginBottom: 6 }}>
                  <Text style={[styles.rowText, { color: colors.text }]}>{emotion.emotion}</Text>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.muted}>Intensity: <Text style={{ color: getIntensityColor(emotion.intensity) }}>{emotion.intensity}</Text></Text>
                    {'trigger' in emotion && !!emotion.trigger && (<Text style={styles.muted}>Trigger: {emotion.trigger}</Text>)}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        {trend && Array.isArray(trend.themes_topics) && trend.themes_topics.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.subheading, { color: colors.accent }]}>Key Themes:</Text>
            <View style={styles.badgeWrap}>
              {trend.themes_topics.map((theme: any, idx: number) => (
                <View key={idx} style={[styles.badge, { borderColor: colors.border, backgroundColor: colors.mutedBg }]}>
                  <Text style={[styles.badgeText, { color: colors.text }]}>
                    {theme.theme} <Text style={{ color: getSentimentColor(theme.sentiment_towards_theme) }}>({theme.sentiment_towards_theme})</Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {trend && trend.patterns && (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.subheading, { color: colors.accent }]}>Patterns</Text>
            <View style={{ marginLeft: 6 }}>
              {Array.isArray(trend.patterns.behavioral) && trend.patterns.behavioral.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.subheadingSmall, { color: colors.accent }]}>Behavioral</Text>
                  {trend.patterns.behavioral.map((p: any, i: number) => (
                    <Text key={`bp-${i}`} style={[styles.muted, { color: colors.muted }]}>• {p.pattern} ({p.frequency_indicator})</Text>
                  ))}
                </View>
              )}
              {Array.isArray(trend.patterns.cognitive) && trend.patterns.cognitive.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.subheadingSmall, { color: colors.accent }]}>Cognitive</Text>
                  {trend.patterns.cognitive.map((p: any, i: number) => (
                    <Text key={`cp-${i}`} style={[styles.muted, { color: colors.muted }]}>• {p.pattern}{p.example_phrase ? ` - "${p.example_phrase}"` : ''}</Text>
                  ))}
                </View>
              )}
              {Array.isArray(trend.patterns.temporal) && trend.patterns.temporal.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.subheadingSmall, { color: colors.accent }]}>Temporal</Text>
                  {trend.patterns.temporal.map((p: any, i: number) => (
                    <Text key={`tp-${i}`} style={[styles.muted, { color: colors.muted }]}>• {p.pattern} ({p.associated_time_period})</Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
        {trend && trend.entities && (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.subheading, { color: colors.accent }]}>Entities</Text>
            <View style={{ marginLeft: 12 }}>
              {renderEntityGroup('People', trend.entities.people, colors.accent, colors)}
              {renderEntityGroup('Organizations', trend.entities.organizations, colors.accent, colors)}
              {renderEntityGroup('Locations', trend.entities.locations, colors.accent, colors)}
              {renderEntityGroup('Events', trend.entities.events, colors.accent, colors)}
              {renderEntityGroup('Products', trend.entities.products, colors.accent, colors)}
            </View>
          </View>
        )}
        {trend && Array.isArray(trend.goals_aspirations) && trend.goals_aspirations.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.subheading, { color: colors.accent }]}>Goals & Aspirations</Text>
            <View style={{ marginLeft: 6 }}>
              {trend.goals_aspirations.map((g: any, i: number) => (
                <View key={`ga-${i}`} style={{ marginBottom: 6 }}>
                  <Text style={[styles.rowText, { color: colors.text }]}>{g.goal}</Text>
                  <Text style={[styles.muted, { color: colors.muted }]}>Status: {g.status}</Text>
                  {'progress_indicator' in g && <Text style={[styles.muted, { color: colors.muted }]}>Progress: {g.progress_indicator}</Text>}
                </View>
              ))}
            </View>
          </View>
        )}
        {trend && Array.isArray(trend.stressors_triggers) && trend.stressors_triggers.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.subheading, { color: colors.accent }]}>Stressors & Triggers</Text>
            <View style={{ marginLeft: 6 }}>
              {trend.stressors_triggers.map((t: any, i: number) => (
                <View key={`st-${i}`} style={{ marginBottom: 6 }}>
                  <Text style={[styles.rowText, { color: colors.text }]}>{t.trigger}</Text>
                  <Text style={[styles.muted, { color: colors.muted }]}>Impact: {t.impact_level}</Text>
                  {'coping_mechanism_mentioned' in t && <Text style={[styles.muted, { color: colors.muted }]}>Coping: {t.coping_mechanism_mentioned}</Text>}
                </View>
              ))}
            </View>
          </View>
        )}
        {trend && Array.isArray(trend.relationships_social_dynamics) && trend.relationships_social_dynamics.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.subheading, { color: colors.accent }]}>Relationships & Social Dynamics</Text>
            <View style={{ marginLeft: 6 }}>
              {trend.relationships_social_dynamics.map((r: any, i: number) => (
                <Text key={`rs-${i}`} style={[styles.muted, { color: colors.muted }]}>• {r.person_or_group}: {r.interaction_summary} <Text style={{ color: getSentimentColor(r.emotional_tone) }}>({r.emotional_tone})</Text></Text>
              ))}
            </View>
          </View>
        )}
        {trend && Array.isArray(trend.health_wellbeing) && trend.health_wellbeing.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.subheading, { color: colors.accent }]}>Health & Wellbeing</Text>
            <View style={{ marginLeft: 6 }}>
              {trend.health_wellbeing.map((h: any, i: number) => (
                <Text key={`hw-${i}`} style={[styles.muted, { color: colors.muted }]}>• {healthWellbeingLabel(h.aspect)}: {h.status_or_change} (Mood Impact: <Text style={{ color: getSentimentColor(h.impact_on_mood) }}>{h.impact_on_mood}</Text>)</Text>
              ))}
            </View>
          </View>
        )}
        {trend && trend.creativity_expression && (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.subheading, { color: colors.accent }]}>Creativity & Expression</Text>
            <View style={{ marginLeft: 6 }}>
              {'readability' in trend.creativity_expression && <Text style={[styles.muted, { color: colors.muted }]}>• Readability: {trend.creativity_expression.readability}</Text>}
              {'vocabulary_richness' in trend.creativity_expression && <Text style={[styles.muted, { color: colors.muted }]}>• Vocabulary Richness: {trend.creativity_expression.vocabulary_richness}</Text>}
              {'writing_style' in trend.creativity_expression && <Text style={[styles.muted, { color: colors.muted }]}>• Writing Style: {trend.creativity_expression.writing_style}</Text>}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 48, gap: 12 },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingTop: 48 
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  backText: { color: '#0f5132', fontWeight: '700' },
  dateContainer: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  headerDate: { fontSize: 16, fontWeight: '700', textAlign: 'center', color: '#111827' },
  headerTime: { fontSize: 14, fontWeight: '500', textAlign: 'center', color: '#6b7280', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  templateSection: { marginTop: 16, marginBottom: 16, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
  templateTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  journalEntryTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8, marginBottom: 8 },
  date: { color: '#6b7280', marginBottom: 4 },
  muted: { color: '#6b7280' },
  content: { marginTop: 8, color: '#111827', lineHeight: 22 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  subheading: { fontWeight: '700', color: '#111827' },
  subheadingSmall: { fontWeight: '700', color: '#111827' },
  rowText: { color: '#111827', fontWeight: '600' },
  badgeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  badge: { borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 9999, backgroundColor: '#f9fafb' },
  badgeText: { color: '#111827', fontWeight: '700' },
})

function getSentimentColor(label: string): string {
  if (label === 'positive') return '#22c55e'
  if (label === 'negative') return '#ef4444'
  if (label === 'neutral') return '#eab308'
  return '#6b7280'
}

function getIntensityColor(label: string): string {
  if (label === 'high') return '#ef4444'
  if (label === 'medium') return '#eab308'
  if (label === 'low') return '#22c55e'
  return '#6b7280'
}

function renderEntityGroup(title: string, items: any[], textColor?: string, colors?: any) {
  if (!Array.isArray(items) || items.length === 0) return null
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={[styles.subheadingSmall, textColor ? { color: textColor } : null]}>{title}:</Text>
      <View style={styles.badgeWrap}>
        {items.map((entity: any, idx: number) => (
          <View key={`${title}-${idx}`} style={[styles.badge, { borderColor: colors?.border, backgroundColor: colors?.mutedBg }]}>
            <Text style={[styles.badgeText, { color: colors?.text }]}>
              {entity.name} <Text style={{ color: getSentimentColor(entity.sentiment) }}>({entity.sentiment})</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function healthWellbeingLabel(aspect: string): string {
  const map: Record<string, string> = {
    physical_health: 'Physical Health',
    sleep: 'Sleep',
    energy_level: 'Energy Level',
    diet: 'Diet',
    exercise: 'Exercise',
    mental_health: 'Mental Health',
    emotional_wellbeing: 'Emotional Wellbeing',
  }
  return map[aspect] || aspect
}


