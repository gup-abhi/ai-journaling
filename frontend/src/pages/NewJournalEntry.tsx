
import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useJournalStore } from '@/stores/journal.store'
import { useNavigate, useLocation } from 'react-router-dom'
import moment from 'moment'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { Mic, MicOff, RotateCcw } from 'lucide-react'
import type { JournalTemplate } from '@/types/JournalTemplate.type'
import { api } from '@/lib/api'

export function NewJournalEntry() {
  const [content, setContent] = useState('')
  const [promptResponses, setPromptResponses] = useState<{[key: number]: string}>({})
  const addJournalEntry = useJournalStore((state) => state.addJournalEntry)
  const navigate = useNavigate()
  const currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a')
  const location = useLocation()
  const [templateId, setTemplateId] = useState<string | "">("");
  const [template, setTemplate] = useState<JournalTemplate | null>(null);
  const templateIdFromUrl = new URLSearchParams(location.search).get('templateId');
  
  useEffect(() => {
    if (templateIdFromUrl) {
      setTemplateId(templateIdFromUrl);
    }
  }, [templateIdFromUrl]);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  useEffect(() => {
    setContent(transcript)
  }, [transcript])

  useEffect(() => {
    const fetchTemplate = async () => {
      if (templateId) {
        try {
          const response = await api.get<JournalTemplate>(`/journal-template/${templateId}`);
          setTemplate(response.data);
          // Initialize prompt responses for each prompt
          const initialResponses: {[key: number]: string} = {};
          response.data.prompts?.forEach((_, index) => {
            initialResponses[index] = '';
          });
          setPromptResponses(initialResponses);
        } catch (error) {
          console.error("Error fetching template:", error);
          setTemplate(null);
        }
      }
    }
    fetchTemplate();
  }, [templateId])

  const handleToggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening()
    } else {
      resetTranscript()
      SpeechRecognition.startListening({ continuous: true })
    }
  }

  const handleReset = () => {
    resetTranscript();
    setContent('');
    // Reset prompt responses
    const resetResponses: {[key: number]: string} = {};
    template?.prompts?.forEach((_, index) => {
      resetResponses[index] = '';
    });
    setPromptResponses(resetResponses);
  };

  const handlePromptResponseChange = (index: number, value: string) => {
    setPromptResponses(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const combineContentWithPrompts = () => {
    let combinedContent = '';

    if (template?.prompts && template.prompts.length > 0) {
      template.prompts.forEach((prompt, index) => {
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
    if (template?.prompts && template.prompts.length > 0) {
      const hasAllPromptResponses = template.prompts.every((_, index) =>
        promptResponses[index] && promptResponses[index].trim().length > 0
      );
      const hasMainContent = content.trim().length > 0;
      return hasAllPromptResponses || hasMainContent;
    }

    // If no template, main content is required
    return content.trim().length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalContent = combineContentWithPrompts();

    // If no template, content is required
    if (!template && !finalContent.trim()) {
      alert('Please write your journal entry content.')
      return
    }

    const newEntry = await addJournalEntry({ content: finalContent, template_id: templateId })
    if (newEntry) {
      navigate(`/journals/${newEntry._id}`)
    }
  }

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Your browser does not support speech recognition.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-2xl font-bold">New Journal Entry</CardTitle>
            <div className="flex items-center gap-2">
              <Button className='text-accent' variant="outline" size="sm" onClick={() => navigate('/journal-templates')}>Choose Journal Template</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>Go Back</Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{currentDateTime}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {template && (
              <div className="mb-4 p-4 border rounded-md bg-muted/50">
                <h2 className="text-xl font-semibold mb-4">Template: {template.name}</h2>
                {template.prompts && template.prompts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Prompts:</h3>
                    {template.prompts.map((prompt, index) => (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={`prompt-${index}`} className="text-sm font-medium text-muted-foreground">
                          {prompt}
                        </Label>
                        <Textarea
                          id={`prompt-${index}`}
                          value={promptResponses[index] || ''}
                          onChange={(e) => handlePromptResponseChange(index, e.target.value)}
                          placeholder="Write your response here..."
                          className="min-h-[80px]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div>
              <Label htmlFor="content" className='text-xl'>
                {template ? 'Additional Content (Optional)' : 'Content'}
              </Label>
              {template && (
                <p className="text-sm text-muted-foreground mb-2">
                  Add any additional thoughts or notes that don't fit the prompts above.
                </p>
              )}
              <div className="relative mt-2">
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required={!template}
                  className="min-h-[150px] pr-20"
                  placeholder={template ? "Write any additional thoughts here..." : "Write your journal entry..."}
                />
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleListening}
                  >
                    {listening ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleReset}
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className={`w-full ${!isContentValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isContentValid()}
            >
              Save Entry
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
