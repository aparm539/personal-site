'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Work' },
] as const;

export default function Header() {
  const [activeSection, setActiveSection] = useState('home');
  const [indicatorLeft, setIndicatorLeft] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  // Update indicator position
  useEffect(() => {
    const updateIndicator = () => {
      const activeRef = itemRefs.current.get(activeSection);
      if (activeRef && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const activeRect = activeRef.getBoundingClientRect();
        setIndicatorLeft(activeRect.left - navRect.left);
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeSection]);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 100;

      if (scrollY < 200) {
        setActiveSection('home');
        return;
      }

      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const section = NAV_ITEMS[i]!.id;
        if (section === 'home') continue;
        
        const element = document.getElementById(section);
        if (element && scrollY >= element.offsetTop - 150) {
          setActiveSection(section);
          return;
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-themetext rounded-full px-2 py-1">
        <nav ref={navRef} className="flex items-center justify-center gap-4 relative">
          <div 
            className="absolute bg-themebg rounded-full transition-all duration-300 ease-out w-[70px] h-7"
            style={{
              left: `${indicatorLeft}px`,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          {NAV_ITEMS.map(({ id, label }) => (
            <Link
              key={id}
              ref={(el) => {
                if (el) itemRefs.current.set(id, el);
              }}
              href={`/#${id}`}
              scroll={false}
              onClick={handleClick(id)}
              className={`text-sm font-medium transition-colors w-[70px] text-center py-1 rounded-full relative z-10 ${
                activeSection === id
                  ? 'text-themetext'
                  : 'text-themebg hover:text-themebg/70'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
