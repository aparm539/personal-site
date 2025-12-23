"use client";

import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from "recharts";
import type { StravaActivity } from "../types/strava";
import {formatDistance, formatElevation, formatTime} from '~/app/utils/strava'

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
    <div className="mt-4 animate-elevation">
      <div className="mb-3">
        <div className="text-sm text-themetext">
          <span className="font-semibold">{formatDistance(totalDistance)}</span> total distance • {" "}
          <span className="font-semibold">{formatElevation(totalElevation)}</span> total elevation • {" "}
          <span className="font-semibold">{formatTime(totalElapsedTime)}</span> total time • {" "}
          <span className="text-themetext">Currently injured</span>
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
                  <div className="bg-themebg border border-themetext px-3 py-2 rounded text-xs">
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
