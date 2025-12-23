import { type ReactNode } from 'react';

interface HighlightProps {
  children: ReactNode;
  className?: string;
  href?: string;
}

export default function Highlight({ children, className = '', href }: HighlightProps) {
  const content = (
    <span
      className={`px-0.5 py-0.125 rounded text-themebg ${className}`}
    >
      {children}
    </span>
  );

  if (href) {
    return (
      <a href={href} className="hover:opacity-70 transition-opacity">
        {content}
      </a>
    );
  }

  return content;
}
