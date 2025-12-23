import GetGithubInfo from "~/app/utils/github-graph";
import { type ContributionLevel, type ContributionWeek, type ColorTheme } from "../types/github-graph";
import { MONTH_LABELS } from "~/app/types/constants"

// GitHub's default colors mapped to levels
const GITHUB_COLOR_TO_LEVEL: Record<string, ContributionLevel> = {
  "#ebedf0": 0, // Light mode - no contributions
  "#9be9a8": 1, // Light mode - low
  "#40c463": 2, // Light mode - medium-low
  "#30a14e": 3, // Light mode - medium-high
  "#216e39": 4, // Light mode - high
  "#161b22": 0, // Dark mode - no contributions
  "#0e4429": 1, // Dark mode - low
  "#006d32": 2, // Dark mode - medium-low
  "#26a641": 3, // Dark mode - medium-high
  "#39d353": 4, // Dark mode - high
};


const COLOR_THEMES: Record<string, ColorTheme> = {
  github: {
    level0: "#161b22",
    level1: "#0e4429",
    level2: "#006d32",
    level3: "#26a641",
    level4: "#39d353",
  },
  gruvbox: {
    level0: "#3c3836", 
    level1: "#8ec07c", 
    level2: "#689d6a", 
    level3: "#427b58", 
    level4: "#b8bb26", 
  },
  custom: { 
    level0: "#3c3836", 
    level1: "#0e4429",
    level2: "#006d32",
    level3: "#26a641",
    level4: "#39d353",

  }
};

function getContributionLevel(githubColor: string): ContributionLevel {
  const normalizedColor = githubColor.toLowerCase();
  return GITHUB_COLOR_TO_LEVEL[normalizedColor] ?? 0;
}

function getMappedColor(githubColor: string, theme: ColorTheme): string {
  const level = getContributionLevel(githubColor);
  switch (level) {
    case 0:
      return theme.level0;
    case 1:
      return theme.level1;
    case 2:
      return theme.level2;
    case 3:
      return theme.level3;
    case 4:
      return theme.level4;
    default:
      return theme.level0;
  }
}



function getMonthLabels(weeks: ContributionWeek[]) {
  const labels: { month: string; index: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstDay = week.contributionDays[0];
    if (firstDay) {
      const date = new Date(firstDay.date);
      const month = date.getMonth();
      if (month !== lastMonth) {
        labels.push({ month: MONTH_LABELS[month] ?? "", index: weekIndex });
        lastMonth = month;
      }
    }
  });

  return labels;
}

interface GithubGraphProps {
  colorTheme?: keyof typeof COLOR_THEMES | ColorTheme;
}

export default async function GithubGraph({
  colorTheme = "custom",
}: GithubGraphProps) {
    const response = await GetGithubInfo()
  const calendar =
    response.data.user.contributionsCollection.contributionCalendar;
  const { totalContributions, weeks } = calendar;
  const monthLabels = getMonthLabels(weeks);

  const resolvedTheme =
    typeof colorTheme === "string" ? COLOR_THEMES[colorTheme] : colorTheme;
    
  const theme: ColorTheme = resolvedTheme ?? COLOR_THEMES.github!;
  
  return (
    <div className="my-6 animate-elevation">
      <div className="mb-3 text-sm text-themetext">
        <span className="font-semibold">{totalContributions.toLocaleString()}</span>{" "}
        contributions in the last year
      </div>

      <div className="overflow-x-auto max-w-full">
        <div className="inline-block">
          <div className="mb-6 flex text-xs text-themetext">
            <div className="w-8" />
            <div className="relative flex">
              {monthLabels.map(({ month, index }) => (
                <div
                  key={`${month}-${index}`}
                  className="absolute text-xs"
                  style={{ left: `${index * 13}px` }}
                >
                  {month}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-0.5">
            <div className="flex w-7 flex-col justify-around pr-1 text-xs text-themetext">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            <div className="flex gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.contributionDays.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="h-2.5 w-2.5 rounded-xs transition-transform hover:scale-125 animate-github-fill"
                      style={{ 
                        '--actual-color': getMappedColor(day.color, theme),
                        '--level0-color': theme.level0,
                        '--appear-delay': `${weekIndex * 15}ms`,
                        '--color-delay': `${weekIndex * 25 + 800}ms`
                      } as React.CSSProperties}
                      title={`${day.contributionCount} contribution${day.contributionCount !== 1 ? "s" : ""} on ${new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-start gap-1 text-xs text-themetext">
            <span>Less</span>
            <div
              className="h-2.5 w-2.5 rounded-xs"
              style={{ backgroundColor: theme.level0 }}
            />
            <div
              className="h-2.5 w-2.5 rounded-xs"
              style={{ backgroundColor: theme.level1 }}
            />
            <div
              className="h-2.5 w-2.5 rounded-xs"
              style={{ backgroundColor: theme.level2 }}
            />
            <div
              className="h-2.5 w-2.5 rounded-xs"
              style={{ backgroundColor: theme.level3 }}
            />
            <div
              className="h-2.5 w-2.5 rounded-xs"
              style={{ backgroundColor: theme.level4 }}
            />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
