import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Brain, TrendingUp, Heart, Lightbulb, Calendar } from 'lucide-react'

const sampleInsights = [
  {
    icon: TrendingUp,
    title: "Mood Trend",
    description: "Your overall mood has improved by 23% over the last 30 days",
    badge: "Positive",
    color: "text-green-500"
  },
  {
    icon: Heart,
    title: "Emotional Pattern",
    description: "You tend to feel most optimistic on Tuesday and Wednesday mornings",
    badge: "Insight",
    color: "text-blue-500"
  },
  {
    icon: Lightbulb,
    title: "Growth Opportunity",
    description: "Consider journaling about your goals more frequently - it correlates with higher satisfaction",
    badge: "Suggestion",
    color: "text-purple-500"
  },
  {
    icon: Calendar,
    title: "Consistency Score",
    description: "You've journaled 18 out of 21 days this month - great consistency!",
    badge: "Achievement",
    color: "text-orange-500"
  }
]

const sampleJournal = {
  date: "Today, 2:30 PM",
  content: "Had an amazing conversation with Sarah about our future plans. Feeling really excited about the possibilities ahead. The project at work is challenging but I'm learning so much. Need to remember to take breaks and not burn out.",
  mood: "Excited & Hopeful",
  wordCount: 47
}

export function Demo() {
  return (
    <section className="py-20 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 inline-flex items-center gap-2">
            <Brain className="h-3 w-3" />
            AI-Powered Insights
          </Badge>
          
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            See how AI transforms your
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              journaling experience
            </span>
          </h2>
          
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch as your daily entries become powerful insights about your emotions, patterns, and growth.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Sample Journal Entry */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground">Your Journal Entry</h3>
            
            <Card className="text-left">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{sampleJournal.date}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {sampleJournal.wordCount} words
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed mb-4">
                  "{sampleJournal.content}"
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Mood:</span>
                  <Badge variant="secondary" className="text-xs">
                    {sampleJournal.mood}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <p className="text-sm text-muted-foreground">
              This is just a sample. Your real journal entries will be processed by our AI to generate 
              personalized insights and patterns.
            </p>
          </div>
          
          {/* AI Insights */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground">AI-Generated Insights</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sampleInsights.map((insight, index) => (
                <Card key={index} className="group hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="mb-3 rounded-lg bg-primary/10 p-2 w-fit group-hover:bg-primary/20 transition-colors">
                      <insight.icon className={`h-5 w-5 ${insight.color}`} />
                    </div>
                    <Badge variant="secondary" className="w-fit text-xs">
                      {insight.badge}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-base mb-2">{insight.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {insight.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground">
              These insights are generated in real-time as you write, helping you understand 
              yourself better with each entry.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
