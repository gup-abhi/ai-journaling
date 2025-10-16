import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTimelineStore } from '@/stores/timeline.store'
import Timeline from '@/components/Timeline'
import PeriodSelector from '@/components/PeriodSelector'
import { type TimelinePeriod } from '@/types/Timeline.type'

export function TimelinePage() {
  const navigate = useNavigate()
  const {
    timelineData,
    isLoading,
    selectedPeriod,
    selectedTheme,
    fetchTimelineData,
    setSelectedPeriod,
    setSelectedTheme
  } = useTimelineStore()

  useEffect(() => {
    fetchTimelineData(selectedPeriod)
  }, [selectedPeriod, fetchTimelineData])

  const handlePeriodChange = (period: TimelinePeriod) => {
    setSelectedPeriod(period)
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Timeline</h1>
          <p className="text-sm text-muted-foreground">
            Explore your journal entries chronologically
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Period Selector */}
        <div className="space-y-3">
          <label className="text-sm font-semibold">Time Period:</label>
          <PeriodSelector 
            selectedPeriod={selectedPeriod} 
            onPeriodChange={handlePeriodChange} 
          />
        </div>

        {/* Timeline Component */}
        <Timeline
          entries={timelineData}
          isLoading={isLoading}
          selectedTheme={selectedTheme}
          onThemeFilter={setSelectedTheme}
          onEntryPress={(entry) => {
            // Could navigate to journal entry detail
            console.log('Timeline entry pressed:', entry.id)
          }}
        />
      </div>
    </div>
  )
}
