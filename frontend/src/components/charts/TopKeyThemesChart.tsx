import { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAiInsightStore } from '@/stores/ai-insight.store';
import { Loader } from '@/components/Loader';
import type { Period } from '@/types/Period.type';

const TopKeyThemesChart = ({ period, limit }: { period: Period, limit: number }) => {
    const { topThemesTrends, isThemesLoading, fetchTopThemes } = useAiInsightStore();

    useEffect(() => {
        fetchTopThemes(period, limit);
    }, [period, limit, fetchTopThemes]);

    if (isThemesLoading) {
        return <Loader className="h-64" />;
    }

    if (topThemesTrends.top_themes.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No theme data available for this period.</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={750}>
            <BarChart layout="vertical" data={topThemesTrends.top_themes} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" label={{ value: "frequency", position: "bottom", offset: 10, fill: "var(--primary)" }} />
                <YAxis type="category" dataKey="theme" width={150} tick={{ fontSize: 12 }} label={{ value: 'Key Theme', angle: -90, position: 'insideLeft' }} />
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
                <Legend verticalAlign="top" align="right" height={40} fill="var(--primary)" />
                <Bar dataKey="frequency" name="frequency" fill="var(--primary)" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TopKeyThemesChart;
