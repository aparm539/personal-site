"use client";
import { useMemo, useRef, useState, useEffect } from "react";
import type { StravaActivity } from "../types/strava";
import { formatDistance, formatElevation, formatTime } from "~/app/utils/strava";
import { useInView } from "../hooks/useInView";

export default function ElevationChart({
  activities,
  totalDistance,
  totalElevation,
  totalElapsedTime,
}: {
  activities: Array<StravaActivity>;
  totalDistance: number; // in km
  totalElevation: number;
  totalElapsedTime: number;
}) {
  // Visualization Constants
  const PITCH_WIDTH = 105; // meters
  const PITCH_HEIGHT = 68; // meters
  const LOOP_GAP = 3; // meters (tight overlap)

  const { pathData, maxRadius, laps } = useMemo(() => {
    if (!totalDistance) return { pathData: "", maxRadius: PITCH_WIDTH / 2 + 20, laps: 0 };

    const totalMeters = totalDistance;
    const points: string[] = [];
    
    // Rectangular Spiral settings
    // Start just outside the pitch boundary
    const w0 = PITCH_WIDTH / 2 + 2; 
    const h0 = PITCH_HEIGHT / 2 + 2;
    const gap = LOOP_GAP; 
    const growthPerRad = gap / (2 * Math.PI);
    
    // Superellipse exponent for rounded corners (higher = sharper)
    // n=10 gives a nice "running track" / rounded rectangle shape
    const n = 10; 

    let currentDist = 0;
    let theta = 0;
    // Resolution
    const step = 0.05; 
    
    let prevX = w0;
    let prevY = 0;
    
    points.push(`${prevX.toFixed(2)},${prevY.toFixed(2)}`);

    while (currentDist < totalMeters) {
      theta += step;
      
      const w = w0 + growthPerRad * theta;
      const h = h0 + growthPerRad * theta;
      
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      
      // Superellipse radius formula: r = ( |cos/w|^n + |sin/h|^n )^(-1/n)
      const term1 = Math.pow(Math.abs(cosT / w), n);
      const term2 = Math.pow(Math.abs(sinT / h), n);
      const r = Math.pow(term1 + term2, -1/n);
      
      const x = r * cosT;
      const y = r * sinT;
      
      const dx = x - prevX;
      const dy = y - prevY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      currentDist += dist;
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
      
      prevX = x;
      prevY = y;
      
      // Safety break
      if (theta > 2000 * Math.PI) break; 
    }

    // Calculate max dimension for viewbox
    const finalW = w0 + growthPerRad * theta;
    const finalH = h0 + growthPerRad * theta;
    const maxDim = Math.max(finalW, finalH);

    return {
      pathData: points.length > 0 ? `M ${points[0]} L ${points.join(" ")}` : "",
      maxRadius: maxDim,
      laps: Math.floor(theta / (2 * Math.PI))
    };
  }, [totalDistance]);

  const { ref: containerRef, isInView } = useInView({ threshold: 0.2 });
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [pathData]);

  if (activities.length === 0) return null;

  // Dynamic viewbox to fit the spiral with some padding
  const viewSize = maxRadius * 2.2;
  const viewBox = `-${viewSize / 2} -${viewSize / 2} ${viewSize} ${viewSize}`;

  return (
    <div ref={containerRef} className="mt-4 animate-elevation">
      <div className="mb-3">
        <div className="text-sm text-themetext">
          <span className="font-semibold">{formatDistance(totalDistance)}</span> total distance •{" "}
          <span className="font-semibold">{formatElevation(totalElevation)}</span> total elevation •{" "}
          <span className="font-semibold">{formatTime(totalElapsedTime)}</span> total time
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Equivalent to circling this soccer pitch <span className="font-mono font-bold text-themetext">{laps}</span> times
        </div>
      </div>
      
      <div className="relative w-full aspect-square max-h-[500px] mx-auto p-4">
        <svg 
          viewBox={viewBox} 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Soccer Pitch Group - Centered */}
          <g transform={`translate(-${PITCH_WIDTH / 2}, -${PITCH_HEIGHT / 2})`}>
            {/* Grass */}
            <rect width={PITCH_WIDTH} height={PITCH_HEIGHT} fill="#4ade80" rx="2" />
            
            {/* Pitch Markings */}
            <g fill="none" stroke="white" strokeWidth="1.5" opacity="0.8">
              {/* Outer Boundary */}
              <rect x="4" y="4" width={PITCH_WIDTH - 8} height={PITCH_HEIGHT - 8} />
              
              {/* Center Line */}
              <line x1={PITCH_WIDTH / 2} y1="4" x2={PITCH_WIDTH / 2} y2={PITCH_HEIGHT - 4} />
              
              {/* Center Circle */}
              <circle cx={PITCH_WIDTH / 2} cy={PITCH_HEIGHT / 2} r="9.15" />
              
              {/* Penalty Areas */}
              <rect x="4" y={(PITCH_HEIGHT - 40.3) / 2} width="16.5" height="40.3" />
              <rect x={PITCH_WIDTH - 20.5} y={(PITCH_HEIGHT - 40.3) / 2} width="16.5" height="40.3" />
              
              {/* Goal Areas */}
              <rect x="4" y={(PITCH_HEIGHT - 18.3) / 2} width="5.5" height="18.3" />
              <rect x={PITCH_WIDTH - 9.5} y={(PITCH_HEIGHT - 18.3) / 2} width="5.5" height="18.3" />
            </g>
          </g>

          {/* Spiral Path */}
          <path 
            ref={pathRef}
            d={pathData} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className="text-themetext"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: pathLength,
              strokeDashoffset: isInView ? 0 : pathLength,
              transition: "stroke-dashoffset 2.5s ease-in",
              opacity: pathLength === 0 ? 0 : 0.8
            }}
          />
          
          {/* Runner / End Marker */}
          {pathData && (
            <circle 
              cx={pathData.split(" ").pop()?.split(",")[0]} 
              cy={pathData.split(" ").pop()?.split(",")[1]} 
              r="4" 
              className="fill-blue-600 stroke-white stroke-2 transition-opacity duration-500 delay-[2500ms]"
              style={{ opacity: isInView ? 1 : 0 }}
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
