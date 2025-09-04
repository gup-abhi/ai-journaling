import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAiInsightStore } from '@/stores/ai-insight.store';
import { useNavigate } from 'react-router-dom';
import type { Period } from '@/types/Period.type';
import { Loader } from '@/components/Loader'; // Import Loader
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
  const [limit, setLimit] = useState(10);
  const [treemapLimit, setTreemapLimit] = useState(10);
  const [cognitivePatternLimit, setCognitivePatternLimit] = useState(10);
  const [topStressorsLimit, setTopStressorsLimit] = useState(10);
  const [period, setPeriod] = useState<Period>('month');
  const { themeActionRadarData, isThemeActionLoading, fetchThemeActionRadarData } = useAiInsightStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchThemeActionRadarData(period);
  }, [period, fetchThemeActionRadarData]);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant={period === 'week' ? 'default' : 'outline'} onClick={() => setPeriod('week')}>Weekly</Button>
          <Button variant={period === 'month' ? 'default' : 'outline'} onClick={() => setPeriod('month')}>Monthly</Button>
          <Button variant={period === 'year' ? 'default' : 'outline'} onClick={() => setPeriod('year')}>Yearly</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className='text-accent'>Sentiment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <SentimentTrendsChart period={period} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className='text-accent'>Top Key Themes (Last {period.toUpperCase()})</CardTitle>
            <Select value={String(limit)} onValueChange={(value) => setLimit(Number(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <TopKeyThemesChart period={period} limit={limit} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-accent'>Emotion Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <EmotionDistributionChart period={period} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-accent'>Emotion Intensity Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <EmotionIntensityHeatmap period={period} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-accent'>Thematic Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <ThematicSentimentChart period={period} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-accent'>Theme Action Radar</CardTitle>
          </CardHeader>
          <CardContent>
            {isThemeActionLoading ? (
              <Loader className="h-64" />
            ) : themeActionRadarData.length > 0 ? (
              <ThemeActionRadarChart period={period} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No theme action data available for this period.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className='text-accent'>Entity Sentiment Treemap</CardTitle>
            <Select value={String(treemapLimit)} onValueChange={(value) => setTreemapLimit(Number(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <EntitySentimentTreemap period={period} limit={treemapLimit} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className='text-accent'>Cognitive Pattern Frequency</CardTitle>
            <Select value={String(cognitivePatternLimit)} onValueChange={(value) => setCognitivePatternLimit(Number(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <CognitivePatternFrequencyChart period={period} limit={cognitivePatternLimit} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className='text-accent'>Top Stressors/Triggers</CardTitle>
            <Select value={String(topStressorsLimit)} onValueChange={(value) => setTopStressorsLimit(Number(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <TopStressorsChart period={period} limit={topStressorsLimit} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
