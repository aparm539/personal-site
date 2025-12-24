import GetStravaActivities from "~/app/utils/strava";
import LapsVisualization from "./lap-path-generator";

// Soccer field perimeter in meters (105m × 68m)
const FIELD_PERIMETER_M = 2 * (105 + 68); // 346m

export default async function StravaActivities() {
  try {
    const data = await GetStravaActivities();

    const activities = data.activities;

    // Calculate totals for all activities
    const totalDistance = activities.reduce((sum, activity) => {
      return sum + activity.distance;
    }, 0);

    // Calculate laps around soccer field (distance is in meters)
    const laps = totalDistance / FIELD_PERIMETER_M;

    return (
      <div className="mt-8">
        <h3 id="running">Running Stats</h3>
        <LapsVisualization laps={laps} className="mx-auto" />
      </div>
    );
  } catch (error) {
    console.error("Failed to load Strava activities:", error);
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Recent Activities</h2>
        <p className="mt-4 text-gray-400">
          Unable to load activities. Please check your Strava API token.
        </p>
      </div>
    );
  }
}
