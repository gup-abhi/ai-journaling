import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader } from "@/components/Loader"; // Assuming Loader is in the same directory or a sibling directory
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Period } from "@/types/Period.type";

interface HeatmapDataPoint {
  emotion: string;
  time_unit: string;
  average_intensity: number;
}

interface TransformedHeatmapData {
  [key: string]: string | number; // time_unit and emotion intensities
  time_unit: string;
}

const EmotionIntensityHeatmap = () => {
  const [period, setPeriod] = useState<Period>("month");
  const [data, setData] = useState<TransformedHeatmapData[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `/api/v1/ai-insights/emotion-intensity-heatmap/period/${period}`
        );
        const rawData: HeatmapDataPoint[] = response.data.intensityMap;

        // Transform data for Recharts BarChart
        const transformedDataMap = new Map<string, TransformedHeatmapData>();
        const uniqueEmotions = new Set<string>();

        rawData.forEach((item) => {
          if (!transformedDataMap.has(item.time_unit)) {
            transformedDataMap.set(item.time_unit, {
              time_unit: item.time_unit,
            });
          }
          const current = transformedDataMap.get(item.time_unit)!;
          current[item.emotion] = item.average_intensity;
          uniqueEmotions.add(item.emotion);
        });

        setData(Array.from(transformedDataMap.values()));
        setEmotions(Array.from(uniqueEmotions).sort()); // Sort emotions alphabetically
      } catch (err) {
        console.error("Error fetching emotion intensity heatmap:", err);
        setError("Failed to load emotion intensity data.");
        toast.error("Failed to load emotion intensity data.");
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, [period]);

  // Function to get color based on intensity (1-3 scale)
  const getIntensityColor = (intensity: number) => {
    if (intensity >= 2.5) return "#FF0000"; // High intensity (red)
    if (intensity >= 1.5) return "#FFA500"; // Medium intensity (orange)
    return "#008000"; // Low intensity (green)
  };

  return (
    <div className="w-full h-[600px]">
      <div className="flex justify-end mb-4">
        <Select
          value={period}
          onValueChange={(value: Period) => setPeriod(value)}
        >
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

      {/* Conditional rendering */}
      {loading ? (
        <Loader className="h-64" />
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No emotion intensity data available for this period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 80, // Increased left margin
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time_unit" />
            <YAxis width={100} /> // Increased Y-axis width
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--primary)",
                borderRadius: "8px",
                color: "var(--primary)",
              }}
              itemStyle={{ color: "var(--accent)" }}
              labelStyle={{ color: "var(--primary)" }}
            />
            <Legend verticalAlign="top" align="right" />
            {emotions.map((emotion) => (
              <Bar
                key={emotion}
                dataKey={emotion}
                stackId="a" // Stack bars if multiple emotions per time unit
                fill={getIntensityColor((data[0]?.[emotion] as number) || 0)} // This will apply the color based on the first data point's intensity for that emotion. Needs refinement for true heatmap.
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default EmotionIntensityHeatmap;
