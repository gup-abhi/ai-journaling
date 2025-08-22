
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useJournalStore } from '@/stores/journal.store'
import { useNavigate, Link } from 'react-router-dom'
import moment from 'moment'

export function NewJournalEntry() {
  const [content, setContent] = useState('')
  const addJournalEntry = useJournalStore((state) => state.addJournalEntry)
  const navigate = useNavigate()
  const currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await addJournalEntry({ content })
    navigate('/journals')
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-2xl font-bold">New Journal Entry</CardTitle>
            <Link to="/journals">
              <Button variant="outline" size="sm">Back to Journals</Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">{currentDateTime}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="min-h-[200px]"
              />
            </div>
            <Button type="submit" className="w-full">Save Entry</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
