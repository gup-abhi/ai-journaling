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


export function Trends() {
  const navigate = useNavigate();

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

