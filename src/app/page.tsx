

import { Github } from 'lucide-react';
import { Linkedin } from 'lucide-react';
import SocialIconContainer from './components/social-icon-container';
import GithubGraph from './components/github-graph';
import StravaActivities from './components/strava-activities';

export default async function HomePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col mt-2 px-6 py-12 md:px-12 md:py-16">
        <h1 className="text-4xl mt-2 text-wrap sm:text-5xl"> Sunny Parmar</h1>

        <p className="mt-3 text-lg sm:text-xl">
          Full-stack developer, student, and maker of many passion projects with a single user. 
        </p>
        <SocialIconContainer> 
          <a href="https://github.com/aparm539">
            <Github></Github>
          </a> 
          <a href='https://www.linkedin.com/in/sunny-parmar-yyc'>
            <Linkedin> </Linkedin>
          </a>
        </SocialIconContainer>
        <h3> About </h3>
        <div className="text-wrap"> 
          <p className=" mt-1 leading-normal">
            I&apos;m never sure what I should put on these things. I primarly make things in TypeScript. 
          </p>
          
        </div>

        <GithubGraph />
        
        <StravaActivities />
      </div>
 
  </div>
  );
}
