import GetStravaActivities from '~/app/utils/strava'
import ElevationChart from './elevation-chart'

export default async function StravaActivities() {
  try {
    const data = await GetStravaActivities()

    const activities = data.activities

    // Calculate totals for all activities
    const totalDistance = activities.reduce((sum, activity) => {
      return sum + activity.distance
    }, 0)

    const totalElevation = activities.reduce((sum, activity) => {
      return sum + activity.total_elevation_gain
    }, 0)

    const totalElapsedTime = activities.reduce((sum, activity) => {
      return sum + activity.elapsed_time
    }, 0)

    return (
      <div className="mt-8">
        <h3 id="running">Running Stats</h3>
        <ElevationChart
          activities={activities}
          totalDistance={totalDistance}
          totalElevation={totalElevation}
          totalElapsedTime={totalElapsedTime}
        />
      </div>
    )
  }
  catch (error) {
    console.error('Failed to load Strava activities:', error)
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Running Stats</h2>
        <p className="mt-4">
          There should be a graph here with some of my running stats.
          I'd love to blame the strava api, but it is probably my fault.
        </p>
      </div>
    )
  }
}
