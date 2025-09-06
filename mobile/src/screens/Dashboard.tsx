import React, { useEffect, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useJournalStore } from '../stores/journal.store'
import { useNavigation } from '@react-navigation/native'
import { useAiInsightStore } from '../stores/ai-insight.store'
import { useGoalStore } from '../stores/goal.store'
import { useStreakStore } from '../stores/streak.store'
import { useAuthStore } from '../stores/auth.store'
import { useThemeColors } from '../theme/colors'

export default function Dashboard() {
  const { fetchTotalEntries, fetchMonthlyEntries, fetchJournalEntries, totalEntries, monthlyEntries, journalEntries } = useJournalStore()
  const { fetchMoodTrends, moodTrends } = useAiInsightStore()
  const { getActiveGoals, activeGoals } = useGoalStore()
  const { getStreakData, streakData } = useStreakStore()
  const { user } = useAuthStore()
  const nav = useNavigation<any>()
  const colors = useThemeColors()

  useEffect(() => {
    fetchTotalEntries()
    fetchMonthlyEntries()
    fetchJournalEntries()
    fetchMoodTrends()
    getActiveGoals()
    getStreakData()
  }, [])

  const recent = useMemo(() => (journalEntries || []).slice(0, 6), [journalEntries])
  const moodValue = useMemo(() => `${moodTrends > 0 ? '+' : ''}${moodTrends.toFixed(2)}%`, [moodTrends])

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      ListHeaderComponent={
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}> 
            {`Welcome back${user ? `, ${user.display_name || user.full_name || user.email}` : ''}`}
          </Text>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <View style={styles.actionsRow}>
              <ActionButton label="Start Journal" onPress={() => nav.navigate('NewJournalEntry')} accent={colors.accent} />
              <ActionButton label="View Journals" variant="secondary" onPress={() => nav.navigate('Journals')} accentBg={colors.accentBg} accentText={colors.accentText} />
              <ActionButton label="Insights" variant="secondary" onPress={() => {}} accentBg={colors.accentBg} accentText={colors.accentText} />
            </View>
          </View>

          {/* Stats */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Progress</Text>
            <View style={styles.statsGrid}>
              <StatCard label="Total Entries" value={String(totalEntries)} accent={colors.accent} />
              <StatCard label="This Month" value={String(monthlyEntries)} accent={colors.accent} />
              <StatCard label="Mood Trend" value={moodValue} accent={moodTrends >= 0 ? colors.accent : '#e74c3c'} />
            </View>
            <View style={[styles.statsGrid, { marginTop: 8 }]}>
              <StatCard label="Current Streak" value={`${streakData?.currentStreak ?? 0} Days`} accent={colors.accent} />
              <StatCard label="Longest Streak" value={`${streakData?.longestStreak ?? 0} Days`} accent={colors.accent} />
              <StatCard label="Active Goals" value={String(activeGoals.length)} accent={colors.accent} />
            </View>
          </View>

          {/* Recent */}
          <Text style={[styles.sectionTitle, { color: colors.accent }]}>Journals</Text>
        </View>
      }
      data={recent}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => nav.navigate('JournalView', { id: item._id })} style={[styles.viewBtnAbsolute, { borderColor: colors.accent, backgroundColor: colors.accentBg, paddingVertical: 4, paddingHorizontal: 8 }]}> 
            <Feather name="eye" size={14} color={colors.accentText} />
          </TouchableOpacity>
          <Text style={[styles.cardDate, { color: colors.muted }]}>{new Date(item.entry_date).toDateString()}</Text>
          <Text numberOfLines={4} style={[styles.cardText, { color: colors.text }]}>{item.content}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={{ paddingHorizontal: 16, color: colors.muted }}>No recent entries yet.</Text>}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  )
}

function ActionButton({ label, onPress, variant, accent, accentBg, accentText }: { label: string; onPress: () => void; variant?: 'primary' | 'secondary'; accent?: string; accentBg?: string; accentText?: string }) {
  const bg = variant === 'secondary' ? (accentBg || '#e5f5ec') : (accent || '#2ecc71')
  const color = variant === 'secondary' ? (accentText || '#0f5132') : '#fff'
  return (
    <TouchableOpacity onPress={onPress} style={[styles.actionBtn, { backgroundColor: bg }]}> 
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </TouchableOpacity>
  )
}

function StatCard({ label, value, accent = '#2ecc71' }: { label: string; value: string; accent?: string }) {
  return (
    <View style={[styles.statCard, { borderColor: accent }]}> 
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontWeight: '700' },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, backgroundColor: '#fff' },
  statLabel: { color: '#6b7280', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800' },
  card: { backgroundColor: '#ffffff', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', position: 'relative' },
  cardDate: { color: '#6b7280', marginBottom: 6 },
  cardText: { color: '#111827' },
  viewBtnAbsolute: { position: 'absolute', top: 8, right: 8, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
  viewBtnText: { fontWeight: '700' },
})


