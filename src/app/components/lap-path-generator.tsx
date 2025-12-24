"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { useInView } from "../hooks/useInView";

// =============================================================================
// CONSTANTS
// =============================================================================

// Real soccer field dimensions (meters)
const FIELD_LENGTH_M = 105;
const FIELD_WIDTH_M = 68;
const PERIMETER_M = 2 * (FIELD_LENGTH_M + FIELD_WIDTH_M); // 346m per lap

// SVG rendering dimensions (pixels)
const SVG_WIDTH = 300;
const SVG_HEIGHT = 180;
const PADDING = 20;

// Field rectangle in SVG coordinates (centered)
const FIELD_LEFT = PADDING;
const FIELD_TOP = PADDING;
const FIELD_RIGHT = SVG_WIDTH - PADDING;
const FIELD_BOTTOM = SVG_HEIGHT - PADDING;
const FIELD_W = FIELD_RIGHT - FIELD_LEFT;
const FIELD_H = FIELD_BOTTOM - FIELD_TOP;

// Corner radius for rounded rectangle path
const CORNER_RADIUS = 12;

// Points per lap for smooth variation
const POINTS_PER_LAP = 120;

// =============================================================================
// DETERMINISTIC NOISE FUNCTION
// =============================================================================

/**
 * Deterministic pseudo-noise function using sine waves.
 * Returns a value in range [-1, 1] based on input seed.
 * Uses multiple frequencies for organic-feeling variation.
 */
function deterministicNoise(seed: number): number {
  // Combine multiple sine waves at different frequencies for richer noise
  const n1 = Math.sin(seed * 12.9898) * 43758.5453;
  const n2 = Math.sin(seed * 78.233) * 12345.6789;
  const n3 = Math.sin(seed * 45.164) * 98765.4321;

  // Normalize to [-1, 1]
  return Math.sin(n1 + n2 + n3);
}

/**
 * Get a noise value for a specific point on a specific lap.
 * This is deterministic: same inputs always produce same output.
 */
function getPointNoise(
  pointIndex: number,
  lapIndex: number,
  component: "x" | "y"
): number {
  // Create a unique seed combining point index, lap index, and component
  const componentOffset = component === "x" ? 0 : 1000;
  const seed = pointIndex * 0.1 + lapIndex * 7.3 + componentOffset;

  return deterministicNoise(seed);
}

// =============================================================================
// POINT SAMPLING & NOISE APPLICATION
// =============================================================================

/**
 * Describes a point on the field perimeter with metadata.
 */
interface PerimeterPoint {
  x: number;
  y: number;
  t: number; // Normalized position along perimeter [0, 1]
  isCorner: boolean; // Whether this point is near a corner
  cornerStrength: number; // How close to corner center [0, 1]
}

/**
 * Calculate corner strength based on position along perimeter.
 * Returns value [0, 1] where 1 = exactly at corner, 0 = middle of straight.
 */
function calculateCornerStrength(t: number): number {
  // Corners occur at approximately t = 0.125, 0.375, 0.625, 0.875
  // (midpoints of each side's corner regions)
  const perimeter = 2 * (FIELD_W + FIELD_H);
  const cornerRegionSize = CORNER_RADIUS * 2 / perimeter;

  // Calculate distance to nearest corner
  const cornerPositions = [
    (FIELD_W / 2) / perimeter, // Bottom-right corner start
    (FIELD_W / 2 + FIELD_H) / perimeter, // Top-right corner
    (FIELD_W / 2 + FIELD_H + FIELD_W) / perimeter, // Top-left corner
    (FIELD_W / 2 + FIELD_H + FIELD_W + FIELD_H) / perimeter, // Bottom-left corner
  ];

  let minDistance = 1;
  for (const cornerT of cornerPositions) {
    // Handle wraparound at t=0/t=1
    const dist = Math.min(
      Math.abs(t - cornerT),
      Math.abs(t - cornerT + 1),
      Math.abs(t - cornerT - 1)
    );
    minDistance = Math.min(minDistance, dist);
  }

  // Convert distance to strength (closer = stronger)
  const normalizedDist = minDistance / cornerRegionSize;
  return Math.max(0, 1 - normalizedDist);
}

/**
 * Sample a point along the field perimeter at normalized position t [0, 1].
 * The path goes: bottom-right → right side up → top → left side down → back to start.
 */
function sampleBasePoint(t: number): PerimeterPoint {
  // Perimeter segments (in pixels, starting from bottom-center going clockwise)
  const halfWidth = FIELD_W / 2;
  const perimeter = 2 * (FIELD_W + FIELD_H);

  // Convert t to actual distance along perimeter
  const dist = t * perimeter;

  let x: number, y: number;

  if (dist < halfWidth) {
    // Bottom edge, center to right
    x = FIELD_LEFT + halfWidth + dist;
    y = FIELD_BOTTOM;
  } else if (dist < halfWidth + FIELD_H) {
    // Right edge, bottom to top
    x = FIELD_RIGHT;
    y = FIELD_BOTTOM - (dist - halfWidth);
  } else if (dist < halfWidth + FIELD_H + FIELD_W) {
    // Top edge, right to left
    x = FIELD_RIGHT - (dist - halfWidth - FIELD_H);
    y = FIELD_TOP;
  } else if (dist < halfWidth + FIELD_H + FIELD_W + FIELD_H) {
    // Left edge, top to bottom
    x = FIELD_LEFT;
    y = FIELD_TOP + (dist - halfWidth - FIELD_H - FIELD_W);
  } else {
    // Bottom edge, left to center
    x = FIELD_LEFT + (dist - halfWidth - FIELD_H - FIELD_W - FIELD_H);
    y = FIELD_BOTTOM;
  }

  const cornerStrength = calculateCornerStrength(t);

  return {
    x,
    y,
    t,
    isCorner: cornerStrength > 0.3,
    cornerStrength,
  };
}

/**
 * Apply noise to a base point, creating organic variation.
 * Noise is stronger at corners, weaker on straights.
 * All laps overlap on the same general path with slight variation.
 */
function applyNoiseToPoint(
  base: PerimeterPoint,
  pointIndex: number,
  lapIndex: number,
  _totalLaps: number
): { x: number; y: number } {
  // Base noise amplitude (1-3 pixels) - keeps laps overlapping
  const baseAmplitude = 2;

  // Corner multiplier: corners get slightly more variation
  const cornerMultiplier = 1 + base.cornerStrength * 0.5;

  // Calculate noise offset - purely random-looking but deterministic
  const noiseX = getPointNoise(pointIndex, lapIndex, "x");
  const noiseY = getPointNoise(pointIndex, lapIndex, "y");

  const amplitude = baseAmplitude * cornerMultiplier;

  // No outward drift - laps should overlap, not expand
  return {
    x: base.x + noiseX * amplitude,
    y: base.y + noiseY * amplitude,
  };
}

/**
 * Generate all points for a single lap with applied noise.
 */
function generateLapPoints(
  lapIndex: number,
  totalLaps: number
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < POINTS_PER_LAP; i++) {
    const t = i / POINTS_PER_LAP;
    const basePoint = sampleBasePoint(t);
    const noisyPoint = applyNoiseToPoint(basePoint, i, lapIndex, totalLaps);
    points.push(noisyPoint);
  }

  return points;
}

// =============================================================================
// SVG PATH GENERATION
// =============================================================================

/**
 * Convert an array of points to an SVG path string.
 * Uses M (move), L (line), and Z (close) commands.
 */
function pointsToPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";

  const commands: string[] = [];
  const firstPoint = points[0]!;

  // Start at first point
  commands.push(`M ${firstPoint.x.toFixed(2)} ${firstPoint.y.toFixed(2)}`);

  // Line to each subsequent point
  for (let i = 1; i < points.length; i++) {
    const point = points[i]!;
    commands.push(`L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
  }

  // Close the path
  commands.push("Z");

  return commands.join(" ");
}

/**
 * Generate the base soccer field outline (faint reference).
 * Uses rounded rectangle for cleaner look.
 */
function generateFieldOutline(): string {
  const r = CORNER_RADIUS;
  return `
    M ${FIELD_LEFT + r} ${FIELD_BOTTOM}
    L ${FIELD_RIGHT - r} ${FIELD_BOTTOM}
    Q ${FIELD_RIGHT} ${FIELD_BOTTOM} ${FIELD_RIGHT} ${FIELD_BOTTOM - r}
    L ${FIELD_RIGHT} ${FIELD_TOP + r}
    Q ${FIELD_RIGHT} ${FIELD_TOP} ${FIELD_RIGHT - r} ${FIELD_TOP}
    L ${FIELD_LEFT + r} ${FIELD_TOP}
    Q ${FIELD_LEFT} ${FIELD_TOP} ${FIELD_LEFT} ${FIELD_TOP + r}
    L ${FIELD_LEFT} ${FIELD_BOTTOM - r}
    Q ${FIELD_LEFT} ${FIELD_BOTTOM} ${FIELD_LEFT + r} ${FIELD_BOTTOM}
    Z
  `.trim();
}

// =============================================================================
// REACT COMPONENT
// =============================================================================

interface LapsVisualizationProps {
  /** Number of laps to display (can be fractional) */
  laps: number;
  /** Optional class name for the container */
  className?: string;
}

// Animation timing constants
const LAP_DRAW_DURATION_MS = 4000; // Time to draw one lap
const LAP_STAGGER_MS = 4000; // Delay between each lap starting (nearly sequential)

/**
 * Individual lap path component with drawing animation.
 * Uses stroke-dashoffset to create the "drawing" effect.
 */
function AnimatedLapPath({
  path,
  lapIndex,
  totalLaps,
  shouldAnimate,
}: {
  path: string;
  lapIndex: number;
  totalLaps: number;
  shouldAnimate: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [startDrawing, setStartDrawing] = useState(false);

  // Measure path length after mount, then mark as ready
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
      // Small delay to ensure the initial state renders before animation starts
      requestAnimationFrame(() => {
        setIsReady(true);
      });
    }
  }, [path]);

  // Stagger the animation start using setTimeout for reliable sequencing
  useEffect(() => {
    if (isReady && shouldAnimate && !startDrawing) {
      const delay = lapIndex * LAP_STAGGER_MS;
      const timer = setTimeout(() => {
        setStartDrawing(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isReady, shouldAnimate, startDrawing, lapIndex]);

  // Calculate opacity and stroke width (later laps = more prominent)
  const progress = totalLaps > 1 ? lapIndex / (totalLaps - 1) : 1;
  const opacity = 0.3 + progress * 0.5;
  const strokeWidth = 1.5 + progress * 0.5;

  return (
    <path
      ref={pathRef}
      d={path}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-themetext"
      style={{
        opacity: pathLength === 0 ? 0 : opacity,
        strokeDasharray: pathLength,
        strokeDashoffset: startDrawing ? 0 : pathLength,
        transition: isReady ? `stroke-dashoffset ${LAP_DRAW_DURATION_MS}ms ease-in-out` : 'none',
      }}
    />
  );
}

/**
 * Animated partial lap path for fractional distances.
 */
function AnimatedPartialPath({
  path,
  fraction,
  lapIndex,
  shouldAnimate,
}: {
  path: string;
  fraction: number;
  lapIndex: number;
  shouldAnimate: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [startDrawing, setStartDrawing] = useState(false);

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
      requestAnimationFrame(() => {
        setIsReady(true);
      });
    }
  }, [path]);

  // Stagger the animation start using setTimeout for reliable sequencing
  useEffect(() => {
    if (isReady && shouldAnimate && !startDrawing) {
      const delay = lapIndex * LAP_STAGGER_MS;
      const timer = setTimeout(() => {
        setStartDrawing(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isReady, shouldAnimate, startDrawing, lapIndex]);

  const visibleLength = pathLength * fraction;

  return (
    <path
      ref={pathRef}
      d={path}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-themetext"
      style={{
        opacity: pathLength === 0 ? 0 : 0.9,
        strokeDasharray: `${visibleLength} ${pathLength}`,
        strokeDashoffset: startDrawing ? 0 : visibleLength,
        transition: isReady ? `stroke-dashoffset ${LAP_DRAW_DURATION_MS * fraction}ms ease-in-out` : 'none',
      }}
    />
  );
}

/**
 * Visualizes running distance as repeated laps around a soccer field.
 * Each lap has slight variation to create a human, hand-drawn feel.
 *
 * Features:
 * - Deterministic noise (no flickering between renders)
 * - Stronger variation at corners, minimal on straights
 * - Drawing animation that follows the runner's path
 * - Fractional laps render as partial paths
 * - Scroll-triggered animation
 */
export default function LapsVisualization({
  laps,
  className = "",
}: LapsVisualizationProps) {
  const { ref: containerRef, isInView } = useInView({ threshold: 0.2 });
  const [hasAnimated, setHasAnimated] = useState(false);

  // Track when component comes into view for animation
  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  // Generate all lap path data (memoized for performance)
  const { fullLaps, partialLap, fieldOutline } = useMemo(() => {
    const fullLapCount = Math.floor(laps);
    const fractionalPart = laps - fullLapCount;

    // Generate paths for complete laps
    const fullLapPaths: Array<{ path: string; lapIndex: number }> = [];
    for (let i = 0; i < fullLapCount; i++) {
      const points = generateLapPoints(i, laps);
      fullLapPaths.push({
        path: pointsToPath(points),
        lapIndex: i,
      });
    }

    // Generate partial lap if needed
    let partial = null;
    if (fractionalPart > 0.01) {
      const points = generateLapPoints(fullLapCount, laps);
      partial = {
        path: pointsToPath(points).replace(" Z", ""), // Don't close partial path
        fraction: fractionalPart,
        lapIndex: fullLapCount,
      };
    }

    return {
      fullLaps: fullLapPaths,
      partialLap: partial,
      fieldOutline: generateFieldOutline(),
    };
  }, [laps]);

  return (
    <div
      ref={containerRef}
      className={`lap-visualization ${className}`}
      data-in-view={hasAnimated}
    >
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto"
        style={{ maxWidth: `${SVG_WIDTH}px` }}
      >
        {/* Faint base field outline for reference */}
        <path
          d={fieldOutline}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.15}
          className="text-themetext"
        />

        {/* Center line (horizontal) */}
        <line
          x1={SVG_WIDTH / 2}
          y1={FIELD_TOP}
          x2={SVG_WIDTH / 2}
          y2={FIELD_BOTTOM}
          stroke="currentColor"
          strokeWidth={0.5}
          opacity={0.1}
          className="text-themetext"
        />

        {/* Center circle */}
        <circle
          cx={SVG_WIDTH / 2}
          cy={SVG_HEIGHT / 2}
          r={20}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.5}
          opacity={0.1}
          className="text-themetext"
        />

        {/* Completed lap paths - each draws in sequence */}
        {fullLaps.map(({ path, lapIndex }) => (
          <AnimatedLapPath
            key={`lap-${lapIndex}`}
            path={path}
            lapIndex={lapIndex}
            totalLaps={Math.floor(laps)}
            shouldAnimate={hasAnimated}
          />
        ))}

        {/* Partial lap path (if fractional) */}
        {partialLap && (
          <AnimatedPartialPath
            path={partialLap.path}
            fraction={partialLap.fraction}
            lapIndex={partialLap.lapIndex}
            shouldAnimate={hasAnimated}
          />
        )}
      </svg>

      {/* Optional: Display lap count */}
      <div className="text-center mt-2 text-sm opacity-60">
        {laps.toFixed(1)} laps ({(laps * PERIMETER_M / 1000).toFixed(2)} km)
      </div>
    </div>
  );
}
