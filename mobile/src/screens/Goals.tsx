import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useThemeColors } from '../theme/colors'

export default function Goals() {
  const colors = useThemeColors()
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.text }]}>Goals</Text>
      <Text style={{ color: colors.muted }}>Coming soon</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
})


