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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAiInsightStore } from '@/stores/ai-insight.store';
import { useNavigate } from 'react-router-dom';
import type { Period } from '@/types/Period';
import { Loader } from '@/components/Loader'; // Import Loader


interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const sentiment = payload[0].value as number;
    let sentimentLabel = '';
    let sentimentColor = 'text-muted-foreground';

    if (sentiment > 0.5) {
      sentimentLabel = 'Positive';
      sentimentColor = 'text-green-500'; // ✅ green for positive
    } else if (sentiment < -0.5) {
      sentimentLabel = 'Negative';
      sentimentColor = 'text-red-500';   // ✅ red for negative
    } else {
      sentimentLabel = 'Neutral';
      sentimentColor = 'text-yellow-500'; // ✅ yellow for neutral
    }

    return (
      <div className="bg-card p-3 border border-border rounded-md shadow-md">
        <p className="text-sm text-muted-foreground">{`Date: ${label}`}</p>
        <p className={`text-lg font-semibold ${sentimentColor}`}>
          {`Sentiment: ${sentiment.toFixed(4)} (${sentimentLabel})`}
        </p>
      </div>
    );
  }

  return null;
};


export function Trends() {
  const [limit, setLimit] = useState(5);
  const [period, setPeriod] = useState<Period>('month');
  const { sentimentTrends, fetchSentimentTrends, topThemesTrends, fetchTopThemes, isSentimentLoading, isThemesLoading } = useAiInsightStore(); // Get isLoading states
  const navigate = useNavigate();

  useEffect(() => {
    fetchSentimentTrends(period);
  }, [period, fetchSentimentTrends]);

  useEffect(() => {
    fetchTopThemes(period, limit);
  }, [period, limit, fetchTopThemes]);

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
          <CardTitle className='text-accent'>Sentiment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end gap-2 mb-4">
            <Button variant={period === 'week' ? 'default' : 'outline'} onClick={() => setPeriod('week')}>Weekly</Button>
            <Button variant={period === 'month' ? 'default' : 'outline'} onClick={() => setPeriod('month')}>Monthly</Button>
            <Button variant={period === 'year' ? 'default' : 'outline'} onClick={() => setPeriod('year')}>Yearly</Button>
          </div>
          {isSentimentLoading ? ( // Conditionally render Loader
            <Loader className="h-64" />
          ) : sentimentTrends.length > 0 ? (
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
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No sentiment data available for this period.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className='text-accent'>Top Key Themes (Last {period.toUpperCase()})</CardTitle>
          <Select value={String(limit)} onValueChange={(value) => setLimit(Number(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isThemesLoading ? ( // Conditionally render Loader
            <Loader className="h-64" /> 
          ) : topThemesTrends.top_themes.length > 0 ? (
            <ResponsiveContainer width="100%" height={750}>
              <BarChart layout="vertical" data={topThemesTrends.top_themes} margin={{ top: 20, right: 30, left: 120, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" label={{ value: "frequency", position: "bottom", offset: 10, fill: "var(--primary)" }} />
                <YAxis type="category" dataKey="theme" label={{ value: "Key Theme", angle: -90, position: "insideLeft", offset: -75, fill: "var(--primary)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)", // tooltip box background
                    border: "1px solid var(--primary)",   // border color
                    borderRadius: "8px",
                    color: "var(--primary)"               // text color
                  }}
                  itemStyle={{ color: "var(--accent)" }}  // frequency text color
                  labelStyle={{ color: "var(--primary)" }} // theme label color
                />
                <Legend verticalAlign="top" align="center" height={40} fill="var(--primary)" />
                <Bar dataKey="frequency" name="frequency" fill="var(--primary)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No theme data available for this period.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
