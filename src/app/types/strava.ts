export interface StravaActivity {
  distance: number; // in meters
  elapsed_time: number; // in seconds
  total_elevation_gain: number; // in meters
}

export interface StravaStats {
  activities: StravaActivity[];
  totalDistance: number; // in kilometers
  totalActivities: number;
  totalElevation: number; // in meters
}
