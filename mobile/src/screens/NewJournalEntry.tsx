import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { useJournalStore } from '../stores/journal.store'
import { useNavigation } from '@react-navigation/native'

export default function NewJournalEntry() {
  const { addJournalEntry, fetchJournalTemplates, journalTemplates } = useJournalStore()
  const [content, setContent] = useState('')
  const [templateId, setTemplateId] = useState<string | null>(null)
  const nav = useNavigation<any>()

  useEffect(() => { fetchJournalTemplates() }, [])

  const onSubmit = async () => {
    const entry = await addJournalEntry({ content, template_id: templateId })
    if (entry) nav.goBack()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Journal Entry</Text>
      <TextInput
        style={styles.input}
        placeholder="Write your thoughts..."
        value={content}
        onChangeText={setContent}
        multiline
      />
      {/* Minimal template selection placeholder to keep parity */}
      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, minHeight: 160, textAlignVertical: 'top' },
  button: { backgroundColor: '#2ecc71', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: 'white', fontWeight: '700' },
})


