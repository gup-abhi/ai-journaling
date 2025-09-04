import { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAiInsightStore } from '@/stores/ai-insight.store';
import { Loader } from '@/components/Loader';
import type { Period } from '@/types/Period.type';

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
            sentimentColor = 'text-green-500';
        } else if (sentiment < -0.5) {
            sentimentLabel = 'Negative';
            sentimentColor = 'text-red-500';
        } else {
            sentimentLabel = 'Neutral';
            sentimentColor = 'text-yellow-500';
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

const formatYAxisTick = (tick: number) => {
    if (tick > 0.5) return 'Positive';
    if (tick < -0.5) return 'Negative';
    return 'Neutral';
};

const SentimentTrendsChart = ({ period }: { period: Period }) => {
    const { sentimentTrends, isSentimentLoading, fetchSentimentTrends } = useAiInsightStore();

    useEffect(() => {
        fetchSentimentTrends(period);
    }, [period, fetchSentimentTrends]);

    if (isSentimentLoading) {
        return <Loader className="h-64" />;
    }

    if (sentimentTrends.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No sentiment data available for this period.</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={sentimentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[-1, 1]} tickFormatter={formatYAxisTick} tick={{ fontSize: 12 }} label={{ value: 'Sentiment Score', angle: -90, position: 'insideLeft', offset: -20 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="sentiment" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default SentimentTrendsChart;
