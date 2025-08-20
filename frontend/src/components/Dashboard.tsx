import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Shield, LogOut, Mic, PenTool, Brain, TrendingUp, Calendar, Plus } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

export function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const signOutStore = useAuthStore(s => s.signOut)
  const [userName] = useState('User')

  const handleSignOut = () => {
    signOutStore()
    navigate('/')
  }

  const recentEntries = [
    { id: 1, date: 'Today, 2:30 PM', preview: 'Had an amazing conversation with Sarah about our future plans...', mood: 'Excited', wordCount: 47 },
    { id: 2, date: 'Yesterday, 9:15 AM', preview: 'Feeling a bit overwhelmed with work today, but trying to stay positive...', mood: 'Thoughtful', wordCount: 32 },
    { id: 3, date: '2 days ago, 7:45 PM', preview: 'Great workout session today! Really proud of my progress...', mood: 'Accomplished', wordCount: 28 },
  ]

  const quickStats = [
    { label: 'Total Entries', value: '47', icon: PenTool, color: 'text-blue-500' },
    { label: 'This Month', value: '18', icon: Calendar, color: 'text-green-500' },
    { label: 'Mood Trend', value: '+23%', icon: TrendingUp, color: 'text-purple-500' },
    { label: 'AI Insights', value: '12', icon: Brain, color: 'text-orange-500' },
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
              <Button variant="outline" size="sm">
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

      {/* Success Message */}
      {location.state?.message && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-600">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">{location.state.message}</span>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button size="lg" className="h-20 text-lg">
              <Mic className="h-6 w-6 mr-3" />
              Start Voice Journal
            </Button>
            <Button size="lg" variant="outline" className="h-20 text-lg">
              <PenTool className="h-6 w-6 mr-3" />
              Write Text Journal
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <h2 className="text-2xl font-bold text-foreground mb-4">Recent Entries</h2>
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
                    <Badge variant="secondary" className="text-xs">
                      {entry.mood}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Read More
                    </Button>
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
