"use client";

import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from "recharts";
import type { StravaActivity } from "../types/strava";

function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

function formatElevation(meters: number): string {
  return `${Math.round(meters)} m`;
}

function formatTime(seconds: number): string {
  const hours = Math.round(seconds / 3600);
  return `${hours.toLocaleString()} hrs`;
}

export default function ElevationChart({
  activities,
  totalDistance,
  totalElevation,
  totalElapsedTime,
}: {
  activities: Array<StravaActivity>;
  totalDistance: number;
  totalElevation: number;
  totalElapsedTime: number;
}) {
  if (activities.length === 0) return null;

  const chartData: Array<{ index: number; elevation: number; distance: number }> = [];
  let runningTotal = 0;
  activities.forEach((a, i) => {
    runningTotal += a.total_elevation_gain;
    chartData.push({ 
      index: i, 
      elevation: runningTotal,
      distance: a.distance
    });
  });

  return (
    <div className="mt-4">
      <div className="mb-3">
        <div className="text-sm text-themetext/80">
          <span className="font-semibold">{formatDistance(totalDistance)}</span> total distance • {" "}
          <span className="font-semibold">{formatElevation(totalElevation)}</span> total elevation • {" "}
          <span className="font-semibold">{formatTime(totalElapsedTime)}</span> total time • {" "}
          <span className="text-themetext/60">Currently injured</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={96}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis dataKey="index" hide />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip
            content={({ active, payload }) => {
              const data = (payload?.[0] as { payload: typeof chartData[0] })?.payload;
              if (active && data) {
                return (
                  <div className="bg-black/90 border border-gray-700 px-3 py-2 rounded text-xs">
                    <p>{formatDistance(data.distance)}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="elevation"
            stroke="currentColor"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={2000}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
