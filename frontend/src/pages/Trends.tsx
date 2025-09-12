import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import EmotionDistributionChart from '../components/charts/EmotionDistributionChart';
import EmotionIntensityHeatmap from '../components/charts/EmotionIntensityHeatmap';
import ThematicSentimentChart from '../components/charts/ThematicSentimentChart';
import ThemeActionRadarChart from '../components/charts/ThemeActionRadarChart';
import EntitySentimentTreemap from '../components/charts/EntitySentimentTreemap';
import CognitivePatternFrequencyChart from '../components/charts/CognitivePatternFrequencyChart';
import TopStressorsChart from '../components/charts/TopStressorsChart';
import SentimentTrendsChart from '../components/charts/SentimentTrendsChart';
import TopKeyThemesChart from '../components/charts/TopKeyThemesChart';
import { useStreakStore } from '@/stores/streak.store';
import Calendar from 'react-calendar';
import '../styles/Calendar.css';

export function Trends() {
  const navigate = useNavigate();
  const { journalingDays, getStreakData } = useStreakStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    getStreakData();
  }, [getStreakData]);

  useEffect(() => {
    console.log('Journaling days data:', journalingDays);
    if (journalingDays) {
      console.log('Journaling days size:', journalingDays.size);
      console.log('Journaling days entries:', Array.from(journalingDays.entries()));
    }
  }, [journalingDays]);

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
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className='text-accent'>Journaling Activity</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total journaled days: {getJournaledDaysCount()}
            </p>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-accent'>Sentiment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <SentimentTrendsChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-accent'>Top Key Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <TopKeyThemesChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-accent'>Emotion Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <EmotionDistributionChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-accent'>Emotion Intensity Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <EmotionIntensityHeatmap />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-accent'>Thematic Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <ThematicSentimentChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-accent'>Theme Action Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeActionRadarChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-accent'>Entity Sentiment Treemap</CardTitle>
          </CardHeader>
          <CardContent>
            <EntitySentimentTreemap />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-accent'>Cognitive Pattern Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <CognitivePatternFrequencyChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-accent'>Top Stressors/Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <TopStressorsChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

