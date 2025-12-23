

import { Github } from 'lucide-react';
import { Linkedin } from 'lucide-react';
import SocialIconContainer from './components/social-icon-container';
import GithubGraph from './components/github-graph';
import StravaActivities from './components/strava-activities';
import Script from 'next/script';
import Highlight from './components/highlight';
import ProjectGrid from './components/project-grid';
import AnimationWrapper from './components/animation-wrapper';

export default async function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Sunny Parmar',
    url: 'https://sunnyparmar.com',
    sameAs: [
      'https://www.linkedin.com/in/sunny-parmar-yyc',
      'https://github.com/aparm539',
      'https://www.instagram.com/sunnyparmar22'
    ],
    jobTitle: 'Software Engineer',
    worksFor: {
      '@type': 'Organization',
      name: 'Freelance'
    }
  }
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col px-6 py-12 md:px-12 md:py-16  min-h-screen">
        <h1 className="text-4xl mt-2 text-wrap sm:text-5xl"> Sunny Parmar</h1>

        <p className="mt-3 text-lg sm:text-xl">
          tl;dr: Full-stack developer, student, and maker of many passion projects with a single user. 
        </p>
        <SocialIconContainer> 
          <a href="https://github.com/aparm539">
            <Github></Github>
          </a> 
          <a href='https://www.linkedin.com/in/sunny-parmar-yyc'>
            <Linkedin> </Linkedin>
          </a>
        </SocialIconContainer>
        <h2 id="about" className="text-xl sm:text-2xl"> About </h2>
        <div className="text-wrap"> 
          <p className=" mt-1 leading-normal">
             Hello! Nice of you to visit my small corner of the internet. 
          </p>
          <br></br>
          <p>I&apos;m Sunny, a Computer Information Systems student at Mount Royal University (MRU) and living being since 2001.
             I&apos;m currently <Highlight href="#" className="bg-[#fe8019]">looking for exciting opportunities</Highlight> to work in an internship or new grad role.</p>
          <br></br>
          <p>School has never been my thing, so I usually have a few other things on the go to keep me busy.
             I could be descibed as a <Highlight href="https://devpost.com/aparm539" className="bg-[#b8bb26]" >hackathon enjoyer</Highlight>; I&apos;m currently the President of <Highlight href="https://mruhacks.ca/" className="bg-[#fb4934]">MRUHacks</Highlight>, MRU&apos;s very own, 100% student-run hackathon.
              I&apos;ve recently started learning <Highlight href="#projects" className="bg-[#fabd2f]">Typescript</Highlight>, and it has become my tool of choice for development projects.</p>
          <br></br>
          <p>Outside of my &quot;professional&quot; life, you can find me <Highlight href="#running" className="bg-[#83a598]">running</Highlight>, although I am dealing with some mysterious knee pain.
             I&apos;ve also recently picked up <Highlight href="https://www.chess.com/member/notcloudyjustsunny" className="bg-[#d3869b]">chess</Highlight>, and I might be the worse player in the history of the game.
              If you need a confidence boost, I&apos;m always happy to help. </p>
          <br></br>
          <p>You&apos;ll find some of my <Highlight href="#projects" className="bg-[#8ec07c]">previous work</Highlight> on this site, but this is also a place for me to experiment with different ideas. A sandbox, if you will.
           As such, it remains a living document, prone to changes and regressions.</p>
        </div>
        
        <AnimationWrapper>
          <StravaActivities />
        </AnimationWrapper>
        <AnimationWrapper>
          <GithubGraph />
        </AnimationWrapper>
        <ProjectGrid></ProjectGrid>
      </div>
      <Script
  id="json-ld"
  type="application/ld+json"
  strategy="beforeInteractive"
>
  {JSON.stringify(jsonLd)}
</Script>
 
  </div>
  );
}
