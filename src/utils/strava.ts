import { type StravaStats, type StravaActivity } from "~/app/types/strava";

async function refreshAccessToken(): Promise<string> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing Strava environment variables: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, or STRAVA_REFRESH_TOKEN"
    );
  }

  try {
    const response = await fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Token refresh failed: ${response.statusText}`
      );
    }

    const data = (await response.json()) as { access_token: string };
    return data.access_token;
  } catch (error) {
    console.error("Error refreshing Strava token:", error);
    throw error;
  }
}

export default async function getStravaActivities(): Promise<StravaStats> {
  const endpoint = "https://www.strava.com/api/v3/athlete/activities";

  try {
    // Get a fresh access token
    const accessToken = await refreshAccessToken();

    const response = await fetch(endpoint, {
      method: "GET",
      next: { revalidate: 86400 }, // 1 hour
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching Strava data: ${response.statusText}`
      );
    }

    const activities: StravaActivity[] =
      (await response.json()) as StravaActivity[];

    // Calculate statistics
    const totalDistance = activities.reduce((sum, activity) => {
      return sum + activity.distance;
    }, 0);

    const totalElevation = activities.reduce((sum, activity) => {
      return sum + activity.total_elevation_gain;
    }, 0);

    return {
      activities: activities,
      totalDistance: totalDistance,
      totalActivities: activities.length,
      totalElevation,
    };
  } catch (error) {
    console.error(`Error in getStravaActivities: `, error);
    throw error;
  }
}
