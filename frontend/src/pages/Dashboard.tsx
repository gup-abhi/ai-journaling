import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Mic, PenTool, Brain, TrendingUp, Calendar, TrendingDown, Flame } from 'lucide-react'
import { useJournalStore } from '@/stores/journal.store'
import type { JournalEntry } from '@/types/JournalEntry.type'
import { useAiInsightStore } from '@/stores/ai-insight.store'
import { useGoalStore } from '@/stores/goal.store'
import { useStreakStore } from '@/stores/streak.store'
import { Loader } from '@/components/Loader'
import toast from 'react-hot-toast'

export function Dashboard() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const { fetchTotalEntries, fetchMonthlyEntries, fetchJournalEntries, totalEntries, monthlyEntries, journalEntries } = useJournalStore() as { fetchTotalEntries: () => Promise<void>; fetchMonthlyEntries: () => Promise<void>; fetchJournalEntries: () => Promise<void>; totalEntries: number; monthlyEntries: number; journalEntries: JournalEntry[] }
  const { fetchMoodTrends, moodTrends } = useAiInsightStore() as { fetchMoodTrends: () => Promise<void>; moodTrends: number }
  const { activeGoals, getActiveGoals } = useGoalStore();
  const { streakData, getStreakData } = useStreakStore();


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await Promise.allSettled([
          fetchTotalEntries(),
          fetchMonthlyEntries(),
          fetchJournalEntries(),
          fetchMoodTrends(),
          getActiveGoals(),
          getStreakData(),
        ])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to fetch dashboard data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [fetchTotalEntries, fetchMonthlyEntries, fetchJournalEntries, fetchMoodTrends, getActiveGoals, getStreakData]);

  const recentEntries = journalEntries.slice(0, 6).map(entry => ({
    id: entry._id,
    date: new Date(entry.entry_date).toLocaleString(),
    preview: entry.content.slice(0, 100) + '...',
    wordCount: entry.word_count
  }));

  const quickStats = [
    { label: 'Total Entries', value: totalEntries, icon: PenTool, color: 'text-blue-500' },
    { label: 'This Month', value: monthlyEntries, icon: Calendar, color: 'text-green-500' },
    { label: 'Current Streak', value: `${streakData?.currentStreak || 0} Days`, icon: Flame, color: 'text-orange-500' },
    { label: 'Longest Streak', value: `${streakData?.longestStreak || 0} Days`, icon: Flame, color: 'text-red-500' },
    { label: 'Mood Trend', value: `${moodTrends > 0 ? '+' : ''}${moodTrends.toFixed(2)}%`, icon: moodTrends > 0 ? TrendingUp : TrendingDown, color: moodTrends > 0 ? 'text-green-500' : 'text-red-500' },
    { label: 'Active Goals', value: activeGoals.length, icon: Brain, color: 'text-purple-500' },
  ]

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button size="lg" className="h-20 text-lg p-2" onClick={() => navigate('/journal/new')}>
              <Mic className="h-6 w-6 mr-3" />
              <span className='text-wrap'>
                Start Voice Or Text Journal
              </span>
            </Button>
            <Button size="lg" variant="secondary" className="h-20 text-lg p-2 text-accent" onClick={() => navigate('/journal-templates')}>
              <PenTool className="h-6 w-6 mr-3" />
              <span className='text-wrap'>
                Browse Journal Templates
              </span>
            </Button>
            <Button size="lg" variant="secondary" className="h-20 text-lg p-2 text-accent" onClick={() => navigate('/goals')}>
              <Brain className="h-6 w-6 mr-3" />
              <span className='text-wrap'>
                Manage Goals
              </span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickStats.map((stat, index) => (
              <Card key={index} className="group hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => stat.label === 'Active Goals' ? navigate('/goals?filter=in-progress') : null}>
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
          {recentEntries.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No recent entries to display. Start journaling to see your recent entries here!</p>
            </div>
          ) : (
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
                  </CardContent>
                  <CardFooter className="pt-3">
                    <div className="flex items-center justify-between">
                      <Link to={`/journals/${entry.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
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
                  <Link to="/trends">
                    <Button variant="outline" size="sm">
                      View All Insights
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
