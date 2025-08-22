import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Shield, LogOut, Mic, PenTool, Brain, TrendingUp, Calendar, Plus, TrendingDown } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useJournalStore } from '@/stores/journal.store'
import type { JournalEntry } from '@/types/JournalEntry'
import { useAiInsightStore } from '@/stores/ai-insight.store'

export function Dashboard() {
  const navigate = useNavigate()
  const signOutStore = useAuthStore(s => s.signOut)
  const [userName] = useState('User')
  const { fetchTotalEntries, fetchMonthlyEntries, fetchJournalEntries, totalEntries, monthlyEntries, journalEntries } = useJournalStore() as { fetchTotalEntries: () => Promise<void>; fetchMonthlyEntries: () => Promise<void>; fetchJournalEntries: () => Promise<void>; totalEntries: number; monthlyEntries: number; journalEntries: JournalEntry[] }
  const { fetchMoodTrends, moodTrends } = useAiInsightStore() as { fetchMoodTrends: () => Promise<void>; moodTrends: number }

  const handleSignOut = () => {
    signOutStore()
    navigate('/')
  }

  useEffect(() => {
    fetchTotalEntries()
    fetchMonthlyEntries()
    fetchJournalEntries()
    fetchMoodTrends()
  }, [fetchTotalEntries, fetchMonthlyEntries, fetchJournalEntries, fetchMoodTrends]);

  const recentEntries = journalEntries.slice(0, 3).map(entry => ({
    id: entry._id,
    date: new Date(entry.entry_date).toLocaleString(),
    preview: entry.content.slice(0, 100) + '...',
    wordCount: entry.word_count
  }));

  const quickStats = [
    { label: 'Total Entries', value: totalEntries, icon: PenTool, color: 'text-blue-500' },
    { label: 'This Month', value: monthlyEntries, icon: Calendar, color: 'text-green-500' },
    { label: 'Mood Trend', value: `${moodTrends > 0 ? '+' : ''}${moodTrends.toFixed(2)}%`, icon: moodTrends > 0 ? TrendingUp : TrendingDown, color: moodTrends > 0 ? 'text-green-500' : 'text-red-500' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-2">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AI Journal</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {userName}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/journals/new')}>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button size="lg" className="h-20 text-lg">
              <Mic className="h-6 w-6 mr-3" />
              Start Voice Journal
            </Button>
            <Button size="lg" variant="outline" className="h-20 text-lg" onClick={() => navigate('/journals/new')}>
              <PenTool className="h-6 w-6 mr-3" />
              Write Text Journal
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickStats.map((stat, index) => (
              <Card key={index} className="group hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Entries */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Recent Entries</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/journals')}>Show More</Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {recentEntries.map((entry) => (
              <Card key={entry.id} className="group hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{entry.date}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {entry.wordCount} words
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed mb-3 line-clamp-3">
                    {entry.preview}
                  </p>
                  <div className="flex items-center justify-between">
                    <Link to={`/journals/${entry.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Insights Preview */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">AI Insights</h2>
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/20 p-3">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Mood Pattern Detected</h3>
                  <p className="text-muted-foreground mb-3">
                    You tend to feel most optimistic on Tuesday and Wednesday mornings. 
                    Consider scheduling important meetings during these times.
                  </p>
                  <Button variant="outline" size="sm">
                    View All Insights
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
