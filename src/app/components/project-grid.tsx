import type Project from '~/app/types/projects'
import ProjectCard from './project-card'

const projects: Array<Project> = [
  {
    name: 'MRUHacks 2025',
    tags: ['TypeScript', 'Next.js', 'Hackathon'],
    description: 'Official website and participant management system for MRUHacks 2025.',
    link: 'https://github.com/albertaspsc/mruhacks2025',
  },
  {
    name: 'Chemistry Inventory Management System',
    tags: ['PHP', 'Laravel', 'FilamentPHP'],
    description: 'The MRU Chemistry Department\'s inventory management system. Built with Laravel and FilamentPHP. Currently used at the university and deployed on their servers.',
    link: 'https://github.com/aparm539/comp-4522-final-project',
  },
  {
    name: 'Simul',
    tags: ['TypeScript', 'Next.js', 'Academic'],
    description: 'My COMP 3504: Software engineering term project. A website that allows instructors to upload interactive screencasts which users can view in an online IDE.',
    link: 'https://github.com/MRU-F2025-COMP3504/3504-term-project-simul',
  },
  {
    name: 'Paint Game',
    tags: ['TypeScript', 'Game Development', 'Academic'],
    description: 'An multiplayer paint by numbers game built with TypeScript.',
    link: 'https://github.com/aparm539/paint-game',
  },
]
export default function ProjectGrid() {
  return (
    <div className="mt-12">
      <h2 id="projects" className="text-xl sm:text-2xl mb-2">Projects</h2>
      <div className="flex flex-wrap gap-2 self-center">
        {projects.map(project =>
          <ProjectCard {...project} key={project.name}></ProjectCard>,
        )}
      </div>
    </div>
  )
}
