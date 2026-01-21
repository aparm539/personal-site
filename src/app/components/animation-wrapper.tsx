'use client'

import type { ReactNode } from 'react'
import { useInView } from '~/app/hooks/useInView'

// A wrapper that allows me to use the "useInView" hook by just wrapping the child component with
// this, rather than importing the hook into the individual components.
// I'm not actually sure if this is actually any better, but I haven't used it enough to actually
// have a strong opinion.
export default function AnimationWrapper({ children }: { children: ReactNode }) {
  const { ref, isInView } = useInView()

  return (
    <div ref={ref} data-in-view={isInView} className="overflow-hidden">
      {children}
    </div>
  )
}
