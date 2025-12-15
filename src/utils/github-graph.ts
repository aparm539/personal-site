import {type GitHubResponse}  from "~/app/types/github-graph";
export default async function GetGithubInfo(): Promise<GitHubResponse>{
    const endpoint = 'https://api.github.com/graphql';
    const token = process.env.GITHUB_TOKEN; 
    try { 
        const response = await fetch (endpoint, { 
            method: 'POST',
            next: { revalidate: 86400 }, // 1 days
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, 
            },
            body: JSON.stringify({
                query: `{
                    user(login: "aparm539") {
                        contributionsCollection {
                            contributionCalendar {
                            totalContributions
                            weeks {
                                contributionDays {
                                    contributionCount
                                    date
                                    color
                                }
                            }
                            }
                        }
                    }
                }`
            })
        }); 
        if (!response.ok){ 
            throw new Error('An error occured while making the Github GraphQL call:' + response.statusText)
        }
        const data: GitHubResponse = await response.json() as GitHubResponse;
        return data

    }catch(error){ 
        console.log(`An error occured in the GetGithubInfo method: `,error)
        throw error;
    }

}
    