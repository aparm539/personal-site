export interface ContributionDay {
  contributionCount: number
  date: string
  color: string
}

export interface ContributionWeek {
  contributionDays: ContributionDay[]
}

export interface ContributionCalendar {
  totalContributions: number
  weeks: ContributionWeek[]
}

export interface GitHubResponse {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: ContributionCalendar
      }
    }
  }
}
