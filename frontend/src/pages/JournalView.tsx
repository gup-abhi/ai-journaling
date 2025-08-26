import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, safeRequest } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Smile, Frown, Meh } from 'lucide-react'
import moment from 'moment'
import { Loader } from '@/components/Loader'
import { Badge } from '@/components/ui/badge'
import type { JournalTemplate } from '@/types/JournalTemplate.type'
import type { LanguageComplexity, Sentiment, Trend } from '@/types/Trend.type'

type JournalEntry = {
  _id: string
  content: string
  entry_date: string
  word_count: number
  template_id?: string
}

export function JournalView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [template, setTemplate] = useState<JournalTemplate | null>(null)
  const [keyThemes, setKeyThemes] = useState<string[]>([])
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [patterns, setPatterns] = useState<any | null>(null);
  const [entities, setEntities] = useState<any | null>(null);
  const [goalAspirations, setGoalAspirations] = useState<string[]>([]);
  const [stressTriggers, setStressTriggers] = useState<string[]>([]);
  const [relationshipSocialDynamics, setRelationshipSocialDynamics] = useState<string[]>([]);
  const [healthWellbeing, setHealthWellbeing] = useState<string[]>([]);
  const [creativityReflection, setCreativityReflection] = useState<string[]>([]);
  const [languageComplexity, setLanguageComplexity] = useState<LanguageComplexity | null>(null);

  const fetchJournalSentiment = async (journalId: string) => {
    try {
      const response = await safeRequest(api.get<Trend>(`/ai-insights/trends/journal/${journalId}`));

      if (response.ok && response.data) {
        setKeyThemes(response.data.themes_topics);
        setSentiment(response.data.sentiment);
        setSummary(response.data.summary);
        setPatterns(response.data.patterns);
        setEntities(response.data.entities);
        setGoalAspirations(response.data.goals_aspirations);
        setStressTriggers(response.data.stressors_triggers);
        setRelationshipSocialDynamics(response.data.relationships_social_dynamics);
        setHealthWellbeing(response.data.health_wellbeing);
        setCreativityReflection(response.data.creativity_expression);
        setLanguageComplexity(response.data.language_complexity);
      } else {
        clearData();
      }
    } catch (error) {
      console.error("Error fetching journal sentiment:", error);
      clearData();
    }
  };

  const clearData = () => {
      setKeyThemes([]);
      setSentiment(null);
      setSummary(null);
      setPatterns(null);
      setEntities(null);
      setGoalAspirations([]);
      setStressTriggers([]);
      setRelationshipSocialDynamics([]);
      setHealthWellbeing([]);
      setCreativityReflection([]);
      setLanguageComplexity(null);  
  }


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
                    {sentiment && (
                      <Badge variant="outline" className="flex items-center gap-2">
                        {getSentimentIcon(sentiment.overall)}
                        <span>{sentiment.overall} ({((sentiment.score * 100).toFixed(2))}%)</span>
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
                {summary && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Summarized:</h4>
                    <p className='text-muted-foreground'>{summary}</p>
                  </div>
                )}

                {sentiment && sentiment.acknowledgement && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Compassionate Note:</h4>
                    <p className='text-muted-foreground'>{sentiment.acknowledgement}</p>
                  </div>
                )}

                {keyThemes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-accent">Key Themes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {keyThemes.map((theme, index) => (
                        <Badge
                          variant="secondary"
                          className="h-10 bg-accent-background text-muted-foreground text-sm"
                          key={index}
                        >
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {patterns && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className="text-accent">
                      Pattern:
                    </h4>
                    <div className="ml-4">
                      {patterns && patterns.behavioral && patterns.behavioral.length > 0 && (
                        <>
                          <h4 className='text-accent'>Behavioral Patterns:</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            {patterns.behavioral.map((pattern: string, index: number) => (
                              <li key={index}>{pattern}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {patterns && patterns.cognitive && patterns.cognitive.length > 0 && (
                        <>
                          <h4 className='text-accent'>Cognitive Patterns:</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            {patterns.cognitive.map((pattern: string, index: number) => (
                              <li key={index}>{pattern}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {patterns && patterns.temporal && patterns.temporal.length > 0 && (
                        <>
                          <h4 className='text-accent'>Temporal Patterns:</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            {patterns.temporal.map((pattern: string, index: number) => (
                              <li key={index}>{pattern}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {entities && entities.people.length !== 0 && entities.organizations.length !== 0 && entities.locations.length !== 0 && entities.events.length !== 0 && entities.products.length !== 0 && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Entities:</h4>
                    <div className="ml-4">
                      {entities.people.length > 0 && (
                        <>
                          <h5 className='text-accent ml-4'>People:</h5>
                          {/* <ul className="list-disc list-inside space-y-1 text-muted-foreground"> */}
                            {entities.people.map((entity: string, index: number) => (
                              <Badge key={index} variant="secondary"
                                  className="h-10 bg-accent-background text-muted-foreground text-sm">
                                    {entity}
                              </Badge>
                            ))}
                          {/* </ul> */}
                        </>
                      )}

                      {entities.organizations.length > 0 && (
                        <>
                          <h5 className='text-accent'>Organizations:</h5>
                          {/* <ul className="list-disc list-inside space-y-1 text-muted-foreground"> */}
                            {entities.organizations.map((entity: string, index: number) => (
                              <Badge key={index} variant="secondary"
                                className="h-10 bg-accent-background text-muted-foreground text-sm">
                                  {entity}
                              </Badge>
                            ))}
                          {/* </ul> */}
                        </>
                      )}

                      {entities.locations.length > 0 && (
                        <>
                          <h5 className='text-foreground'>Locations:</h5>
                          {/* <ul className="list-disc list-inside space-y-1 text-muted-foreground"> */}
                            {entities.locations.map((entity: string, index: number) => (
                              <Badge key={index} variant="secondary"
                                className="h-10 bg-accent-background text-muted-foreground text-sm">
                                  {entity}
                              </Badge>
                            ))}
                          {/* </ul> */}
                        </>
                      )}

                      {entities.events.length > 0 && (
                        <>
                          <h5 className='text-foreground'>Events:</h5>
                          {/* <ul className="list-disc list-inside space-y-1 text-muted-foreground"> */}
                            {entities.events.map((entity: string, index: number) => (
                              <Badge key={index} variant="secondary"
                                className="h-10 bg-accent-background text-muted-foreground text-sm">
                                  {entity}
                              </Badge>
                            ))}
                          {/* </ul> */}
                        </>
                      )}

                      {entities.products.length > 0 && (
                        <>
                          <h5 className='text-foreground'>Products:</h5>
                          {/* <ul className="list-disc list-inside space-y-1 text-muted-foreground"> */}
                            {entities.products.map((entity: string, index: number) => (
                              <Badge key={index} variant="secondary"
                                className="h-10 bg-accent-background text-muted-foreground text-sm">
                                  {entity}
                              </Badge>
                            ))}
                          {/* </ul> */}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {goalAspirations.length > 0 && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Goals & Aspirations:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      {goalAspirations.map((goal: string, index: number) => (
                        <li key={index}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {stressTriggers.length > 0 && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Stressors & Triggers:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      {stressTriggers.map((trigger: string, index: number) => (
                        <li key={index}>{trigger}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {relationshipSocialDynamics.length > 0 && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Relationships & Social Dynamics:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      {relationshipSocialDynamics.map((relationship: string, index: number) => (
                        <li key={index}>{relationship}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {healthWellbeing.length > 0 && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Health & Wellbeing:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      {healthWellbeing.map((health: string, index: number) => (
                        <li key={index}>{health}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {creativityReflection.length > 0 && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Creativity Reflection:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      {creativityReflection.map((reflection: string, index: number) => (
                        <li key={index}>{reflection}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {languageComplexity && (
                  <div className="text-md whitespace-pre-wrap mt-4">
                    <h4 className='text-accent'>Language Complexity:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li className='text-foreground'>Readability: <span className="text-muted-foreground">{languageComplexity.readability}</span></li>
                      <li className='text-foreground'>Vocabulary Richness: <span className="text-muted-foreground">{languageComplexity.vocabulary_richness}</span></li>
                      <li className='text-foreground'>Writing Style: <span className="text-muted-foreground">{languageComplexity.writing_style}</span></li>
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