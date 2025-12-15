export interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface GitHubResponse {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: ContributionCalendar;
      };
    };
  };
}

// Color mapping types
export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ColorTheme {
  level0: string; // No contributions
  level1: string; // Low
  level2: string; // Medium-low
  level3: string; // Medium-high
  level4: string; // High
}