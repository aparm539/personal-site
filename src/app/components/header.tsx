'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import ThemeToggle from './theme-toggle';

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
] as const;

export default function Header() {
  const [activeSection, setActiveSection] = useState('home');
  const navRef = useRef<HTMLDivElement>(null);

  const activeIndex = Math.max(0, NAV_ITEMS.findIndex((n) => n.id === activeSection));
  const percent = 100 / NAV_ITEMS.length;
  const indicatorLeftPercent = activeIndex * percent;


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
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed w-full sm:w-fit sm:top-4 sm:left-1/2 sm:-translate-x-1/2 z-50">
      <div className="bg-themetext sm:rounded-full px-2 py-1 flex items-center gap-2">
        <nav ref={navRef} className="relative grid grid-cols-3 items-center grow">
          <div
            className="absolute z-0 bg-themebg rounded-full transition-all duration-300 ease-out h-7"
            style={{
              left: `${indicatorLeftPercent}%`,
              width: `${percent}%`,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          {NAV_ITEMS.map(({ id, label }) => (
            <Link
              key={id}
              href={`/#${id}`}
              scroll={false}
              onClick={handleClick(id)}
              className={`text-sm font-medium transition-colors w-full text-center py-1 px-2 rounded-full relative z-10 ${
                activeSection === id
                  ? 'text-themetext'
                  : 'text-themebg hover:text-themebg/70'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="text-themebg justify-end">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
