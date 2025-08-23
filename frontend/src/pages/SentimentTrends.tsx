import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAiInsightStore } from '@/stores/ai-insight.store';
import { useNavigate } from 'react-router-dom';

type Period = 'week' | 'month' | 'year';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const sentiment = payload[0].value;
    let sentimentLabel = '';
    if (sentiment > 0.5) sentimentLabel = 'Positive';
    else if (sentiment < -0.5) sentimentLabel = 'Negative';
    else sentimentLabel = 'Neutral';

    return (
      <div className="bg-card p-3 border rounded-md shadow-md">
        <p className="text-sm text-muted-foreground">{`Date: ${label}`}</p>
        <p className="text-lg font-semibold text-foreground">{`Sentiment: ${sentiment.toFixed(4)} (${sentimentLabel})`}</p>
      </div>
    );
  }

  return null;
};

export function SentimentTrends() {
  const [period, setPeriod] = useState<Period>('month');
  const { sentimentTrends, fetchSentimentTrends } = useAiInsightStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSentimentTrends(period);
  }, [period, fetchSentimentTrends]);

  const formatYAxisTick = (tick: number) => {
    if (tick > 0.5) return 'Positive';
    if (tick < -0.5) return 'Negative';
    return 'Neutral';
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
        Go Back
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end gap-2 mb-4">
            <Button variant={period === 'week' ? 'default' : 'outline'} onClick={() => setPeriod('week')}>Week</Button>
            <Button variant={period === 'month' ? 'default' : 'outline'} onClick={() => setPeriod('month')}>Month</Button>
            <Button variant={period === 'year' ? 'default' : 'outline'} onClick={() => setPeriod('year')}>Year</Button>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={sentimentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[-1, 1]} tickFormatter={formatYAxisTick} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="sentiment" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
