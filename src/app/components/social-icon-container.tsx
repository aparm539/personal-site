import type { ReactNode } from 'react'
import { Children } from 'react'

export default function SocialIconContainer({ children}: { children: ReactNode }) {
  return (
    <div className="flex gap-2 my-6">
      {Children.map(children, child => (
        <div>
          {child}
        </div>
      ))}
    </div>

  )
}
