import { useEffect, useState } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { useAiInsightStore } from '@/stores/ai-insight.store';
import { Loader } from '@/components/Loader';
import type { Period } from '@/types/Period.type';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, frequency, avgSentiment } = payload[0].payload;
    let sentimentLabel = 'Neutral';
    let sentimentColor = 'text-yellow-500';
    if (avgSentiment > 0.2) {
        sentimentLabel = 'Positive';
        sentimentColor = 'text-green-500';
    }
    if (avgSentiment < -0.2) {
        sentimentLabel = 'Negative';
        sentimentColor = 'text-red-500';
    }

    return (
      <div className="bg-card p-3 border border-border rounded-md shadow-md" style={{ backgroundColor: 'var(--background)' }}>
        <p className="text-sm text-muted-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">Frequency: {frequency}</p>
        <p className={`text-lg font-semibold ${sentimentColor}`}>
          {`Avg. Sentiment: ${avgSentiment.toFixed(2)} (${sentimentLabel})`}
        </p>
      </div>
    );
  }

  return null;
};

const EntitySentimentTreemap = () => {
  const [period, setPeriod] = useState<Period>('month');
  const [limit, setLimit] = useState(10);
  const { entitySentimentTreemap, isEntitySentimentLoading, fetchEntitySentimentTreemap } = useAiInsightStore();

  useEffect(() => {
    fetchEntitySentimentTreemap(period, limit);
  }, [period, limit, fetchEntitySentimentTreemap]);

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
        {isEntitySentimentLoading ? (
            <Loader className="h-64" />
        ) : entitySentimentTreemap.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
            <Treemap
                data={entitySentimentTreemap}
                dataKey="frequency"
                stroke="#fff"
                content={<CustomizedContent />}
            >
                <Tooltip content={<CustomTooltip />} />
            </Treemap>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No entity data available for this period.</p>
            </div>
        )}
    </div>
  );
};

const CustomizedContent = (props: any) => {
  const { x, y, width, height, name, avgSentiment } = props;

  // Sentiment color logic
  let sentimentColor = '#8884d8'; // Neutral
  if (avgSentiment > 0.2) sentimentColor = '#82ca9d'; // Positive
  else if (avgSentiment < -0.2) sentimentColor = '#ffc658'; // Negative

  const padding = 4;

  // Dynamic font scaling
  const aspectRatio = width / height;
  const baseSize = Math.min(width, height) / 5;
  const fontSize = Math.max(8, Math.min(16, aspectRatio < 0.5 ? baseSize * 0.8 : baseSize));

  const shouldRenderText = width > 35;

  return (
    <g>
      {/* Rectangle background */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: sentimentColor,
          stroke: '#fff',
          strokeWidth: 2,
        }}
      />
      {shouldRenderText && (
        <foreignObject
          x={x + padding}
          y={y + padding}
          width={width - padding * 2}
          height={height - padding * 2}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              color: "white",
              fontSize: fontSize,
              lineHeight: "1.1",
              overflow: "hidden",
              whiteSpace: "normal",
              wordBreak: "break-word",
              WebkitLineClamp: 3,       // max lines
              WebkitBoxOrient: "vertical",
              // display: "-webkit-box",
            }}
          >
            {name}
          </div>
        </foreignObject>
      )}
    </g>
  );
};



export default EntitySentimentTreemap;
