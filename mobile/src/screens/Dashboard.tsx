import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native'
import Toast from 'react-native-simple-toast'
import { Feather } from '@expo/vector-icons'
import { useJournalStore } from '../stores/journal.store'
import { useNavigation } from '@react-navigation/native'
import { useAiInsightStore } from '../stores/ai-insight.store'
import { useGoalStore } from '../stores/goal.store'
import { useStreakStore } from '../stores/streak.store'
import { useAuthStore } from '../stores/auth.store'
import { useThemeColors } from '../theme/colors'
import Header from '../components/Header'
import NudgeCard from '../components/NudgeCard'

// Helper function to get first name from user data
const getFirstName = (user: any): string => {
  // Try display_name or full_name first
  const name = user.display_name || user.full_name || user.email || '';

  if (!name) return '';

  // If it's an email, take everything before @
  if (name.includes('@')) {
    return name.split('@')[0];
  }

  // If it's a full name with spaces, take the first part
  if (name.includes(' ')) {
    return name.split(' ')[0];
  }

  // If it's a single word, use it as is
  return name;
};

export default function Dashboard() {
  const { fetchTotalEntries, fetchMonthlyEntries, refreshDashboardEntries, totalEntries, monthlyEntries, dashboardEntries } = useJournalStore()
  const { fetchMoodTrends, moodTrends, fetchNudges, nudges, isNudgesLoading } = useAiInsightStore()
  const { getActiveGoals, activeGoals } = useGoalStore()
  const { getStreakData, streakData } = useStreakStore()
  const { user, getUser, isAuthenticated } = useAuthStore()
  const nav = useNavigation<any>()
  const colors = useThemeColors()

  const [refreshing, setRefreshing] = useState(false)

  const loadAllData = useCallback(async () => {
    console.log('🔄 Reloading all dashboard data...')
    await Promise.all([
      fetchTotalEntries(),
      fetchMonthlyEntries(),
      refreshDashboardEntries(),
      fetchMoodTrends(),
      fetchNudges(),
      getActiveGoals(),
      getStreakData(),
      getUser()
    ])
  }, [fetchTotalEntries, fetchMonthlyEntries, refreshDashboardEntries, fetchMoodTrends, fetchNudges, getActiveGoals, getStreakData])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadAllData()
    } finally {
      setRefreshing(false)
    }
  }, [loadAllData])

  useEffect(() => {
      console.log('🚀 Dashboard mounted, loading data...')
      loadAllData()
  }, [loadAllData])

  const recent = useMemo(() => (dashboardEntries || []).slice(0, 6), [dashboardEntries])
  const moodValue = useMemo(() => `${moodTrends > 0 ? '+' : ''}${moodTrends.toFixed(2)}%`, [moodTrends])
  const moodAccent = useMemo(() => (moodTrends > 0 ? colors.accent : (moodTrends < 0 ? '#e74c3c' : '#eab308')), [moodTrends, colors.accent])


  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.accent]}
          tintColor={colors.accent}
          title="Pull to refresh"
          titleColor={colors.muted}
        />
      }
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          variant="dashboard"
          title="Dashboard"
        />

        {/* Quick Actions */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <ActionButton label="Start Journal" onPress={() => nav.navigate('NewJournalEntry')} accent={colors.accent} />
            <ActionButton label="View Journals" variant="secondary" onPress={() => nav.navigate('Journals')} accentBg={colors.accentBg} accentText={colors.accentText} />
            <ActionButton label="Templates" variant="secondary" onPress={() => nav.navigate('JournalTemplates')} accentBg={colors.accentBg} accentText={colors.accentText} />
          </View>
        </View>

        {/* Nudges */}
        {nudges && nudges.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Insights & Suggestions</Text>
            {isNudgesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.muted }]}>Loading insights...</Text>
              </View>
            ) : (
              nudges.map((nudge) => (
                <NudgeCard
                  key={nudge.id}
                  id={nudge.id}
                  title={nudge.title}
                  message={nudge.message}
                  priority={nudge.priority}
                  action={nudge.action}
                  generatedAt={nudge.generatedAt}
                  onPress={() => {
                    // Handle nudge action based on action type
                    switch (nudge.action) {
                      case 'journal_now':
                        nav.navigate('NewJournalEntry')
                        break
                      case 'plan_activity':
                        nav.navigate('NewGoal')
                        break
                      case 'self_care':
                        nav.navigate('Trends')
                        break
                      default:
                        Toast.show('Nudge action: ' + nudge.action)
                    }
                  }}
                />
              ))
            )}
          </View>
        )}

        {/* Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <StatCard label="Total Entries" value={String(totalEntries)} accent={colors.accent} border={colors.border} bg={colors.cardBg} muted={colors.muted} />
            <StatCard label="This Month" value={String(monthlyEntries)} accent={colors.accent} border={colors.border} bg={colors.cardBg} muted={colors.muted} />
            <StatCard label="Mood Trend" value={moodValue} accent={moodAccent} border={colors.border} bg={colors.cardBg} muted={colors.muted} />
          </View>
          <View style={[styles.statsGrid, { marginTop: 8 }]}>
            <StatCard label="Current Streak" value={`${streakData?.currentStreak ?? 0} Days`} accent={colors.accent} border={colors.border} bg={colors.cardBg} muted={colors.muted} />
            <StatCard label="Longest Streak" value={`${streakData?.longestStreak ?? 0} Days`} accent={colors.accent} border={colors.border} bg={colors.cardBg} muted={colors.muted} />
            <StatCard label="Active Goals" value={String(activeGoals.length)} accent={colors.accent} border={colors.border} bg={colors.cardBg} muted={colors.muted} />
          </View>
        </View>

        {/* Recent Journals */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Journals</Text>
          {recent && recent.length > 0 ? (
            recent.map((item) => (
              <View key={item._id} style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => nav.navigate('JournalView', { id: item._id })}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={[styles.viewBtnAbsolute, { borderColor: colors.accent, backgroundColor: colors.accentBg, paddingVertical: 4, paddingHorizontal: 8, zIndex: 10, elevation: 2 }]}
                >
                  <Feather name="eye" size={14} color={colors.accentText} />
                </TouchableOpacity>
                <Text style={[styles.cardDate, { color: colors.muted }]}>{new Date(item.entry_date).toDateString()}</Text>
                <Text numberOfLines={4} style={[styles.cardText, { color: colors.text }]}>{item.content}</Text>
              </View>
            ))
          ) : (
            <Text style={{ paddingHorizontal: 16, color: colors.muted }}>No recent entries yet.</Text>
          )}
        </View>
      </View>
    </ScrollView>
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

function StatCard({ label, value, accent = '#2ecc71', border = '#e5e7eb', bg = '#fff', muted = '#6b7280' }: { label: string; value: string; accent?: string; border?: string; bg?: string; muted?: string }) {
  return (
    <View style={[styles.statCard, { borderColor: border, backgroundColor: bg }]}> 
      <Text style={[styles.statLabel, { color: muted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 48 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontWeight: '700' },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12 },
  statLabel: { marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800' },
  card: { backgroundColor: '#ffffff', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', position: 'relative' },
  cardDate: { color: '#6b7280', marginBottom: 6 },
  cardText: { color: '#111827' },
  viewBtnAbsolute: { position: 'absolute', top: 8, right: 8, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
  viewBtnText: { fontWeight: '700' },
  loadingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 20 
  },
  loadingText: { 
    marginLeft: 8, 
    fontSize: 14 
  },
})


