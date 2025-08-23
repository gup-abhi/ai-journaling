
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
import type { JournalTemplate } from '@/types/JournalTemplate'
import { api, safeRequest } from '@/lib/api'

export function NewJournalEntry() {
  const [content, setContent] = useState('')
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
        const response = await safeRequest(api.get<JournalTemplate>(`/journal-template/${templateId}`));
        if (response.ok) {
          setTemplate(response.data);
        } else {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await addJournalEntry({ content, template_id: templateId })
    navigate('/journals')
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
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Go Back</Button>
          </div>
          <p className="text-sm text-muted-foreground">{currentDateTime}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {template && (
              <div className="mb-4 p-4 border rounded-md bg-muted/50">
                <h2 className="text-xl font-semibold mb-2">Template: {template.name}</h2>
                {template.prompts && template.prompts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-1">Prompts:</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {template.prompts.map((prompt, index) => (
                        <li key={index}>{prompt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div>
              <Label htmlFor="content" className='text-xl'>Content</Label>
              <div className="relative mt-2">
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="min-h-[200px] pr-20"
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
            <Button type="submit" className="w-full">Save Entry</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
