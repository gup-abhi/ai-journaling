import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useStreakStore } from '@/stores/streak.store';
import { useAiInsightStore } from '@/stores/ai-insight.store';
import Calendar from 'react-calendar';
import '../styles/Calendar.css';

// Import new components
import PeriodSelector from '../components/PeriodSelector';
import NarrativeSummary from '../components/NarrativeSummary';
import SentimentSummaryCard from '../components/SentimentSummaryCard';
import TopThemesCard from '../components/TopThemesCard';
import TimelineButton from '../components/TimelineButton';

export function Trends() {
  const navigate = useNavigate();
  const { journalingDays, getStreakData } = useStreakStore();
  const {
    sentimentSummaryData,
    topThemesData,
    isSentimentSummaryLoading,
    isTopThemesDataLoading,
    fetchSentimentSummary,
    fetchTopThemesData
  } = useAiInsightStore();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    getStreakData();
  }, [getStreakData]);

  useEffect(() => {
    fetchSentimentSummary(selectedPeriod);
    fetchTopThemesData(selectedPeriod, 8);
  }, [selectedPeriod, fetchSentimentSummary, fetchTopThemesData]);

  const handlePeriodChange = (period: 'week' | 'month' | 'year') => {
    setSelectedPeriod(period);
    fetchSentimentSummary(period);
    fetchTopThemesData(period, 8);
  };


  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      if (journalingDays && journalingDays.get(dateString)) {
        return 'journaled-day';
      }
    }
    return null;
  };

  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const getJournaledDaysCount = () => {
    if (!journalingDays) return 0;
    return Array.from(journalingDays.values()).filter(Boolean).length;
  };


  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>

      <div className="space-y-6">
        {/* Period Selector */}
        <div className="mb-6">
          <PeriodSelector 
            selectedPeriod={selectedPeriod} 
            onPeriodChange={handlePeriodChange} 
          />
        </div>

        {/* Narrative Summary */}
        {isSentimentSummaryLoading ? (
          <div className="border rounded-lg p-6 bg-card text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
              <span className="text-sm text-muted-foreground">Loading your story...</span>
            </div>
          </div>
        ) : sentimentSummaryData && sentimentSummaryData.narrativeSummary ? (
          <NarrativeSummary 
            summary={sentimentSummaryData.narrativeSummary}
            onPress={() => {
              // Card click handled without notification
            }}
          />
        ) : sentimentSummaryData && !sentimentSummaryData.narrativeSummary ? (
          <div className="border rounded-lg p-6 bg-card text-center">
            <p className="text-muted-foreground">Unable to generate narrative summary</p>
            <p className="text-sm text-muted-foreground mt-1">Try refreshing or check back later</p>
          </div>
        ) : null}

        {/* Sentiment Summary */}
        {isSentimentSummaryLoading ? (
          <div className="border rounded-lg p-6 bg-card text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
              <span className="text-sm text-muted-foreground">Loading sentiment data...</span>
            </div>
          </div>
        ) : sentimentSummaryData ? (
          <SentimentSummaryCard 
            data={sentimentSummaryData} 
            onPress={() => {
              // Card click handled without notification
            }}
          />
        ) : (
          <div className="border rounded-lg p-6 bg-card text-center">
            <p className="text-muted-foreground">No sentiment data available</p>
            <p className="text-sm text-muted-foreground mt-1">Start journaling to see your sentiment trends</p>
          </div>
        )}

        {/* Top Themes */}
        {isTopThemesDataLoading ? (
          <div className="border rounded-lg p-6 bg-card text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
              <span className="text-sm text-muted-foreground">Loading themes data...</span>
            </div>
          </div>
        ) : topThemesData && topThemesData.top_themes.length > 0 ? (
          <TopThemesCard 
            data={topThemesData}
            onThemeClick={(theme) => {
              // Navigate to theme detail or filter journals by theme
              console.log('Theme clicked:', theme);
            }}
          />
        ) : (
          <div className="border rounded-lg p-6 bg-card text-center">
            <p className="text-muted-foreground">No themes data available</p>
            <p className="text-sm text-muted-foreground mt-1">Start journaling to see your recurring themes</p>
          </div>
        )}

        {/* Timeline Button */}
        <TimelineButton 
          onPress={() => {
            // Navigate to timeline view
            navigate('/timeline');
          }}
        />

        {/* Calendar */}
        <div className="border rounded-lg p-6 bg-card">
          <h3 className="text-lg font-semibold text-accent mb-3">
            Journaling Activity ({getJournaledDaysCount()} days)
          </h3>
          {journalingDays ? (
            <Calendar 
              value={selectedDate}
              onChange={handleDateChange}
              tileClassName={tileClassName}
              className="w-full"
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading journaling data...</div>
            </div>
          )}
          <div className="mt-4 text-sm text-muted-foreground">
            <p>• Highlighted days show when you journaled</p>
            <p>• Use navigation arrows to view different months/years</p>
          </div>
        </div>
      </div>
    </div>
  );
}

