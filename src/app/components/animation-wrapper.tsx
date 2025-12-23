'use client';

import { useInView } from '~/app/hooks/useInView';
import { type ReactNode } from 'react';

export default function AnimationWrapper({ children }: { children: ReactNode }) {
  const { ref, isInView } = useInView();

  return (
    <div ref={ref} data-in-view={isInView} className='overflow-hidden'>
      {children}
    </div>
  );
}
