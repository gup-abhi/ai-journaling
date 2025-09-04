import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAiInsightStore } from '@/stores/ai-insight.store';
import { Loader } from '@/components/Loader';
import type { Period } from '@/types/Period.type';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TopKeyThemesChart = () => {
    const [period, setPeriod] = useState<Period>('month');
    const [limit, setLimit] = useState(10);
    const { topThemesTrends, isThemesLoading, fetchTopThemes } = useAiInsightStore();

    useEffect(() => {
        fetchTopThemes(period, limit);
    }, [period, limit, fetchTopThemes]);

    return (
        <div>
            <div className="flex justify-end gap-4 mb-4">
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
            {isThemesLoading ? (
                <Loader className="h-64" />
            ) : topThemesTrends.top_themes.length > 0 ? (
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
            ) : (
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No theme data available for this period.</p>
                </div>
            )}
        </div>
    );
};

export default TopKeyThemesChart;