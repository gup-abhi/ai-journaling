
import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useJournalStore } from '@/stores/journal.store'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { Mic, MicOff, RotateCcw } from 'lucide-react'

export function NewJournalEntry() {
  const [content, setContent] = useState('')
  const addJournalEntry = useJournalStore((state) => state.addJournalEntry)
  const navigate = useNavigate()
  const currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a')

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  useEffect(() => {
    setContent(transcript)
  }, [transcript])

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
    await addJournalEntry({ content })
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
            <div>
              <Label htmlFor="content">Content</Label>
              <div className="relative">
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
