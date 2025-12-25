import GetGithubInfo from "~/app/utils/github-graph";
import {type ContributionWeek } from "../types/github-graph";
import { MONTH_LABELS } from "~/app/types/constants"

// Direct map from GitHub contribution hex colors to CSS variables
const GITHUB_COLOR_TO_CSS: Record<string, string> = {
  "#ebedf0": 'var(--level0-color)',
  "#9be9a8": 'var(--level1-color)',
  "#40c463": 'var(--level2-color)',
  "#30a14e": 'var(--level3-color)',
  "#216e39": 'var(--level4-color)',
  "#161b22": 'var(--level0-color)',
  "#0e4429": 'var(--level1-color)',
  "#006d32": 'var(--level2-color)',
  "#26a641": 'var(--level3-color)',
  "#39d353": 'var(--level4-color)',
};

function getMappedColor(githubColor: string): string {
  return GITHUB_COLOR_TO_CSS[githubColor.toLowerCase()] ?? 'var(--level0-color)';
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


export default async function GithubGraph() {
    const response = await GetGithubInfo()
  const calendar =
    response.data.user.contributionsCollection.contributionCalendar;
  const { totalContributions, weeks } = calendar;
  const monthLabels = getMonthLabels(weeks);
  
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
                        '--actual-color': getMappedColor(day.color),
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
              style={{ backgroundColor: 'var(--level0-color)' }}
            />
            <div
              className="h-2.5 w-2.5 rounded-xs"
              style={{ backgroundColor: 'var(--level1-color)' }}
            />
            <div
              className="h-2.5 w-2.5 rounded-xs"
              style={{ backgroundColor: 'var(--level2-color)' }}
            />
            <div
              className="h-2.5 w-2.5 rounded-xs"
              style={{ backgroundColor: 'var(--level3-color)' }}
            />
            <div
              className="h-2.5 w-2.5 rounded-xs"
              style={{ backgroundColor: 'var(--level4-color)' }}
            />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
