import React, { useEffect } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useThemeColors } from '../theme/colors'
import { useJournalStore } from '../stores/journal.store'
import { useNavigation } from '@react-navigation/native'

export default function Journals() {
  const { journalEntries, fetchJournalEntries } = useJournalStore()
  const nav = useNavigation<any>()
  const colors = useThemeColors()
  useEffect(() => {
    console.log('Journals screen: Fetching journal entries...')
    fetchJournalEntries()
  }, [])

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
      
      <FlatList
        style={styles.flatList}
        data={journalEntries}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
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
})


