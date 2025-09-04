import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAiInsightStore } from '@/stores/ai-insight.store';
import { Loader } from '@/components/Loader';
import type { Period } from '@/types/Period.type';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ThematicSentimentChart = () => {
    const [period, setPeriod] = useState<Period>('month');
    const { thematicSentiment, isThematicSentimentLoading, fetchThematicSentiment } = useAiInsightStore();

    useEffect(() => {
        fetchThematicSentiment(period);
    }, [period, fetchThematicSentiment]);

    if (isThematicSentimentLoading) {
        return <Loader className="h-64" />;
    }

    if (thematicSentiment.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No thematic sentiment data available for this period.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">Weekly</SelectItem>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <ResponsiveContainer width="100%" height={600}>
                <BarChart
                    data={thematicSentiment}
                    margin={{
                        top: 40,
                        right: 30,
                        left: 20,
                        bottom: 80,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="theme" angle={-45} textAnchor="end" interval={0} height={80} tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--background)",
                            border: "1px solid var(--primary)",
                            borderRadius: "8px",
                            color: "var(--primary)"
                        }}
                        itemStyle={{ color: "var(--accent)" }}
                        labelStyle={{ color: "var(--primary)" }}
                    />
                    <Legend verticalAlign="top" align="right" />
                    <Bar dataKey="positive" stackId="a" fill="#82ca9d" name="Positive" />
                    <Bar dataKey="negative" stackId="a" fill="#ffc658" name="Negative" />
                    <Bar dataKey="neutral" stackId="a" fill="#8884d8" name="Neutral" />
                    <Bar dataKey="mixed" stackId="a" fill="#ff7300" name="Mixed" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ThematicSentimentChart;