import Highlight from './highlight';
import type Project from '~/app/types/projects' 
import { Github } from 'lucide-react';

export default function ProjectCard(project:Project){ 
    return ( 
        <div className="flex flex-col rounded border-2 border-themetext p-4 md:max-w-lg">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <h4 className="text-lg font-semibold">{project.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-2"> 
                        {project.tags.map((item)=> 
                            <Highlight key={item} className="bg-[#fe8019] text-xs">{item}</Highlight>
                        )}
                    </div>
                </div>
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="shrink-0 mt-1 hover:opacity-70 transition-opacity">
                    <Github size={32} className="text-themetext" />
                </a>
            </div>
            <p className="text-sm text-wrap">{project.description}</p>
        </div>
    )
}