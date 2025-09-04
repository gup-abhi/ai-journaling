import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, safeRequest } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Smile, Frown, Meh, CheckCircle, Hourglass, XCircle, PauseCircle } from 'lucide-react'
import moment from 'moment'
import { Loader } from '@/components/Loader'
import { Badge } from '@/components/ui/badge'
import type { JournalTemplate } from '@/types/JournalTemplate.type'
import type { Trend } from '@/types/Trend.type'

type JournalEntry = {
  _id: string
  content: string
  entry_date: string
  word_count: number
  template_id?: string
}

const health_wellbeing_mapping: { [key: string]: string } = {
  physical_health: "Physical Health",
  sleep: "Sleep",
  energy_level: "Energy Level",
  diet: "Diet",
  exercise: "Exercise",
  mental_health: "Mental Health",
  emotional_wellbeing: "Emotional Wellbeing"
}

export function JournalView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [template, setTemplate] = useState<JournalTemplate | null>(null)
  const [trend, setTrend] = useState<Trend | null>(null)
  const [noInsights, setNoInsights] = useState(false);

  const fetchJournalSentiment = async (journalId: string) => {
    try {
      const response = await safeRequest(api.get<Trend>(`/ai-insights/trends/journal/${journalId}`));

      if (response.ok && response.data) {
        setTrend(response.data)
      } else {
        setNoInsights(true);
      }
    } catch (error) {
      console.error("Error fetching journal sentiment:", error);
      setNoInsights(true);
    }
  };

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id) return
      setIsLoading(true)
      const res = await safeRequest(api.get<JournalEntry>(`/journal/${id}`))
      if (res.ok) {
        setEntry(res.data)
        fetchJournalSentiment(id)
        if (res.data.template_id) {
          const templateRes = await safeRequest(api.get<JournalTemplate>(`/journal-template/${res.data.template_id}`))
          if (templateRes.ok) {
            setTemplate(templateRes.data)
          } else {
            setTemplate(null)
          }
        }
      } else {
        setError(res.error)
      }
      setIsLoading(false)
    }
    fetchEntry()
  }, [id])

  const getSentimentIcon = (label: string) => {
    if (label === 'positive') return <Smile className="h-4 w-4 text-green-500" />
    if (label === 'negative') return <Frown className="h-4 w-4 text-red-500" />
    if (label === 'neutral') return <Meh className="h-4 w-4 text-yellow-500" />
  }

  const getSentimentColorClass = (label: string) => {
    if (label === 'positive') return 'text-green-500'
    if (label === 'negative') return 'text-red-500'
    if (label === 'neutral') return 'text-yellow-500'
    return ''
  }

  const getIntensityColorClass = (label: string) => {
    if (label === 'high') return 'text-red-500'
    if (label === 'medium') return 'text-yellow-500'
    if (label === 'low') return 'text-green-500'
    return ''
  }

  const getProgressIcon = (progress: string) => {
    switch (progress) {
      case "not-started":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case "in-progress":
        return <Hourglass className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "on-hold":
        return <PauseCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <Loader />
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="text-destructive mb-4">Error: {error}</div>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="mb-4">Journal entry not found.</div>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  const formattedDate = moment(entry.entry_date).format('MMMM Do YYYY, h:mm:ss a')

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button variant="outline" onClick={() => navigate("/journals")} className="mb-6">
          Go Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {trend && trend.sentiment && (
                      <Badge variant="outline" className="flex items-center gap-2">
                        {getSentimentIcon(trend.sentiment.overall)}
                        <span>{trend.sentiment.overall} ({((trend.sentiment.score * 100).toFixed(2))}%)</span>
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">{entry.word_count} words</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {template && (
                  <div className="mb-4 p-4 border rounded-md bg-muted/50">
                    <h2 className="text-xl font-semibold mb-2">Template: {template.name}</h2>
                    {template.prompts && template.prompts.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-lg font-medium mb-1">Prompts:</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {template.prompts.map((prompt, index) => (
                            <li key={index}>{prompt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {template.benefits && template.benefits.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-lg font-medium mb-1">Benefits:</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {template.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <h3 className="text-lg text-accent font-bold mb-3">Journal Entry:</h3>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className='text-center'>AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                {noInsights && (
                  <div className="text-center text-muted-foreground">
                    <p>No AI insights available for this entry yet. Check back in a few minutes.</p>
                  </div>
                )}
                {trend && trend.summary && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Summarized:</h4>
                    <p className='text-muted-foreground'>{trend.summary}</p>
                  </div>
                )}

                {trend && trend.sentiment && trend.sentiment.acknowledgement && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Compassionate Note:</h4>
                    <p className='text-muted-foreground'>{trend.sentiment.acknowledgement}</p>
                  </div>
                )}

                {trend && trend.sentiment && trend.sentiment.emotions && trend.sentiment.emotions.length > 0 && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Emotions:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      {trend.sentiment.emotions.map((emotion, index) => (
                        <li key={index}>
                          <span className="text-foreground">{emotion.emotion}</span>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            <li>Intensity: <span className={getIntensityColorClass(emotion.intensity)}>{emotion.intensity}</span></li>
                            <li>Trigger: {emotion.trigger}</li>
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {trend && trend.themes_topics && trend.themes_topics.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-accent">Key Themes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {trend.themes_topics.map((theme, index) => (
                        <Badge
                          variant="outline"
                          className={`h-10 bg-accent-background text-muted-foreground text-sm font-extrabold`}
                          key={index}
                        >
                          {theme.theme} <span className={`ml-2 ${getSentimentColorClass(theme.sentiment_towards_theme)}`}> ({theme.sentiment_towards_theme})</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {trend && trend.patterns && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className="text-accent">
                      Pattern:
                    </h4>
                    <div className="ml-4">
                      {trend.patterns.behavioral && trend.patterns.behavioral.length > 0 && (
                        <>
                          <h4 className='text-accent'>Behavioral Patterns:</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            {trend.patterns.behavioral.map((pattern, index) => (
                              <li key={index}>{pattern.pattern} ({pattern.frequency_indicator})</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {trend.patterns.cognitive && trend.patterns.cognitive.length > 0 && (
                        <>
                          <h4 className='text-accent'>Cognitive Patterns:</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            {trend.patterns.cognitive.map((pattern, index) => (
                              <li key={index}>{pattern.pattern} - "{pattern.example_phrase}"</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {trend.patterns.temporal && trend.patterns.temporal.length > 0 && (
                        <>
                          <h4 className='text-accent'>Temporal Patterns:</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            {trend.patterns.temporal.map((pattern, index) => (
                              <li key={index}>{pattern.pattern} ({pattern.associated_time_period})</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {trend && trend.entities && (trend.entities.people.length > 0 || trend.entities.organizations.length > 0 || trend.entities.locations.length > 0 || trend.entities.events.length > 0 || trend.entities.products.length > 0) && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Entities:</h4>
                    <div className="ml-4">
                      {trend.entities.people.length > 0 && (
                        <>
                          <h5 className='text-accent ml-4'>People:</h5>
                            {trend.entities.people.map((entity, index) => (
                              <Badge key={index} variant="outline"
                                  className="h-10 bg-accent-background text-muted-foreground text-sm">
                                    {entity.name}{' '}
                                    <span className={getSentimentColorClass(entity.sentiment)}>
                                      ({entity.sentiment})
                                    </span>
                              </Badge>
                            ))}
                        </>
                      )}

                      {trend.entities.organizations.length > 0 && (
                        <>
                          <h5 className='text-accent'>Organizations:</h5>
                            {trend.entities.organizations.map((entity, index) => (
                              <Badge key={index} variant="outline"
                                className="h-10 bg-accent-background text-muted-foreground text-sm">
                                  {entity.name}{' '}
                                  <span className={getSentimentColorClass(entity.sentiment)}>
                                    ({entity.sentiment})
                                  </span>
                              </Badge>
                            ))}
                        </>
                      )}

                      {trend.entities.locations.length > 0 && (
                        <>
                          <h5 className='text-accent'>Locations:</h5>
                            {trend.entities.locations.map((entity, index) => (
                              <Badge key={index} variant="outline"
                                className="h-10 bg-accent-background text-muted-foreground text-sm">
                                  {entity.name}{' '}
                                  <span className={getSentimentColorClass(entity.sentiment)}>
                                    ({entity.sentiment})
                                  </span>
                              </Badge>
                            ))}
                        </>
                      )}

                      {trend.entities.events.length > 0 && (
                        <>
                          <h5 className='text-accent'>Events:</h5>
                            {trend.entities.events.map((entity, index) => (
                              <Badge key={index} variant="outline"
                                className="h-10 bg-accent-background text-muted-foreground text-sm">
                                  {entity.name}{' '}
                                  <span className={getSentimentColorClass(entity.sentiment)}>
                                    ({entity.sentiment})
                                  </span>
                              </Badge>
                            ))}
                        </>
                      )}

                      {trend.entities.products.length > 0 && (
                        <>
                          <h5 className='text-accent'>Products:</h5>
                            {trend.entities.products.map((entity, index) => (
                              <Badge key={index} variant="outline"
                                className="h-10 bg-accent-background text-muted-foreground text-sm">
                                  {entity.name}{' '}
                                  <span className={getSentimentColorClass(entity.sentiment)}>
                                    ({entity.sentiment})
                                  </span>
                              </Badge>
                            ))}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {trend && trend.goals_aspirations && trend.goals_aspirations.length > 0 && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Goals & Aspirations:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      {trend.goals_aspirations.map((goal, index) => (
                        <li key={index}>
                          <span className="text-foreground">{goal.goal}</span>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            <li className="flex items-center gap-2">Status: {getProgressIcon(goal.status)} {goal.status}</li>
                            <li>Progress: {goal.progress_indicator}</li>
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {trend && trend.stressors_triggers && trend.stressors_triggers.length > 0 && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Stressors & Triggers:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      {trend.stressors_triggers.map((trigger, index) => (
                        <li key={index}>
                          <span className="text-foreground">{trigger.trigger}</span>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            <li>Impact: {trigger.impact_level}</li>
                            <li>Coping: {trigger.coping_mechanism_mentioned}</li>
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {trend && trend.relationships_social_dynamics && trend.relationships_social_dynamics.length > 0 && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Relationships & Social Dynamics:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      {trend.relationships_social_dynamics.map((relationship, index) => (
                        <li key={index}>{relationship.person_or_group}: {relationship.interaction_summary} <span className={getSentimentColorClass(relationship.emotional_tone)}>({relationship.emotional_tone})</span></li>
                      ))}
                    </ul>
                  </div>
                )}

                {trend && trend.health_wellbeing && trend.health_wellbeing.length > 0 && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Health & Wellbeing:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      {trend.health_wellbeing.map((health, index) => (
                        <li key={index}><span className="text-foreground">{health_wellbeing_mapping[health.aspect]}</span>: {health.status_or_change} (Mood Impact: <span className={getSentimentColorClass(health.impact_on_mood)}>{health.impact_on_mood}</span>)</li>
                      ))}
                    </ul>
                  </div>
                )}

                {trend && trend.creativity_expression && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Creativity & Expression:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Readability: {trend.creativity_expression.readability}</li>
                      <li>Vocabulary Richness: {trend.creativity_expression.vocabulary_richness}</li>
                      <li>Writing Style: {trend.creativity_expression.writing_style}</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}