import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native'
import { useToast } from '../contexts/ToastContext'
import { useJournalStore } from '../stores/journal.store'
import { useNavigation } from '@react-navigation/native'
import { useThemeColors } from '../theme/colors'
import { Feather } from '@expo/vector-icons'
import Header from '../components/Header'

export default function NewJournalEntry() {
  const {
    addJournalEntry,
    selectedTemplate,
    setSelectedTemplate
  } = useJournalStore()
  const { showToast } = useToast()
  const [content, setContent] = useState('')
  const [promptResponses, setPromptResponses] = useState<{[key: number]: string}>({})
  const navigation = useNavigation<any>()
  const colors = useThemeColors()

  useEffect(() => {
    // Clear template when component unmounts
    return () => {
      setSelectedTemplate(null)
    }
  }, [setSelectedTemplate])

  useEffect(() => {
    // Initialize prompt responses when template changes
    if (selectedTemplate?.prompts) {
      const initialResponses: {[key: number]: string} = {};
      selectedTemplate.prompts.forEach((_, index) => {
        initialResponses[index] = '';
      });
      setPromptResponses(initialResponses);
    } else {
      setPromptResponses({});
    }
  }, [selectedTemplate])

  const handlePromptResponseChange = (index: number, value: string) => {
    setPromptResponses(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const combineContentWithPrompts = () => {
    let combinedContent = '';

    if (selectedTemplate?.prompts && selectedTemplate.prompts.length > 0) {
      selectedTemplate.prompts.forEach((prompt, index) => {
        const response = promptResponses[index] || '';
        if (response.trim()) {
          combinedContent += `${prompt}\n\n${response}\n\n`;
        }
      });
    }

    // Add any additional content from the main textarea
    if (content.trim()) {
      combinedContent += content.trim();
    }

    return combinedContent || content;
  };

  const isContentValid = () => {
    // If there's a template, ALL prompts must be filled OR main content must have text
    if (selectedTemplate?.prompts && selectedTemplate.prompts.length > 0) {
      const hasAllPromptResponses = selectedTemplate.prompts.every((_, index) =>
        promptResponses[index] && promptResponses[index].trim().length > 0
      );
      const hasMainContent = content.trim().length > 0;
      return hasAllPromptResponses || hasMainContent;
    }

    // If no template, main content is required
    return content.trim().length > 0;
  };

  const onSubmit = async () => {
    const finalContent = combineContentWithPrompts();

    // If no template, content is required
    if (!selectedTemplate && !finalContent.trim()) {
      showToast('Please write your journal entry content.', 'error')
      return
    }

    const entry = await addJournalEntry({
      content: finalContent.trim(),
      template_id: selectedTemplate?._id || null
    })

    if (entry) {
      showToast('Journal entry saved successfully!', 'success')
      setSelectedTemplate(null)
      setPromptResponses({})
      setContent('')
      navigation.goBack()
    } else {
      showToast('Failed to save journal entry. Please try again.', 'error')
    }
  }

  const handleRemoveTemplate = () => {
    setSelectedTemplate(null)
    setPromptResponses({})
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="New Journal Entry"
        showBackButton={true}
        onBackPress={() => navigation.navigate('Root', { screen: 'Dashboard' })}
        rightButton={{
          icon: 'file-text',
          onPress: () => navigation.navigate('JournalTemplates'),
          accessibilityLabel: 'Select template'
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {selectedTemplate && (
          <View style={[styles.templateCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.templateHeader}>
              <Text style={[styles.templateTitle, { color: colors.accent }]}>
                Template: {selectedTemplate.name}
              </Text>
              <TouchableOpacity onPress={handleRemoveTemplate}>
                <Feather name="x" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
            
            {selectedTemplate.prompts && selectedTemplate.prompts.length > 0 && (
              <View style={styles.templateSection}>
                <Text style={[styles.templateSectionTitle, { color: colors.text }]}>
                  Prompts:
                </Text>
                {selectedTemplate.prompts.map((prompt, index) => (
                  <View key={index} style={styles.promptContainer}>
                    <Text style={[styles.templatePrompt, { color: colors.text }]}>
                      {prompt}
                    </Text>
                    <TextInput
                      style={[
                        styles.promptInput,
                        {
                          backgroundColor: colors.cardBg,
                          borderColor: colors.border,
                          color: colors.text
                        }
                      ]}
                      placeholder="Write your response here..."
                      placeholderTextColor={colors.muted}
                      value={promptResponses[index] || ''}
                      onChangeText={(value) => handlePromptResponseChange(index, value)}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {!selectedTemplate && (
          <View style={styles.templatePromptContainer}>
            <TouchableOpacity
              style={[styles.pickTemplateButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              onPress={() => navigation.navigate('JournalTemplates')}
            >
              <Feather name="file-plus" size={24} color={colors.accent} />
              <View style={styles.pickTemplateTextContainer}>
                <Text style={[styles.pickTemplateTitle, { color: colors.text }]}>
                  Pick a Template
                </Text>
                <Text style={[styles.pickTemplateSubtitle, { color: colors.muted }]}>
                  Get writing prompts and guidance
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            {selectedTemplate ? 'Additional Content (Optional)' : 'Content'}
          </Text>
          {selectedTemplate && (
            <Text style={[styles.inputDescription, { color: colors.muted }]}>
              Add any additional thoughts or notes that don't fit the prompts above.
            </Text>
          )}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                color: colors.text
              }
            ]}
            placeholder={selectedTemplate ? "Write any additional thoughts here..." : "Write your journal entry..."}
            placeholderTextColor={colors.muted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: colors.accent },
            !isContentValid() && { opacity: 0.5 }
          ]}
          onPress={onSubmit}
          disabled={!isContentValid()}
        >
          <Text style={[styles.saveButtonText, { color: colors.background }]}>
            Save Journal Entry
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
  },
  scrollView: {
    flex: 1,
  },
  templateCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  templateSection: {
    gap: 8,
  },
  templateSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  templatePrompt: {
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 8,
  },
  promptContainer: {
    marginBottom: 16,
  },
  promptInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    minHeight: 80,
    fontSize: 16,
    lineHeight: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  templatePromptContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  pickTemplateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  pickTemplateTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  pickTemplateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  pickTemplateSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  inputContainer: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 200,
    fontSize: 16,
    lineHeight: 24,
  },
  saveButton: {
    margin: 16,
    marginTop: 0,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})


