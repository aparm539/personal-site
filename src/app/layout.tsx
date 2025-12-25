import type { Metadata } from 'next'

import Header from './components/header'
import { ThemeProvider } from './components/theme-provider'
import '~/styles/globals.css'

export const metadata: Metadata = {
  title: 'Sunny Parmar | Full-Stack Developer',
  description: 'The personal portfolio of Sunny Parmar, a full-stack developer.',
  keywords: ['Sunny Parmar', 'Full-Stack Developer', 'Portfolio', 'Web Developer'],
  authors: [{ name: 'Sunny Parmar' }],
  creator: 'Sunny Parmar',
  icons: 'data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\'>👋</text></svg>',
  openGraph: {
    title: 'Sunny Parmar - Personal Site',
    description: 'Portfolio of Sunny Parmar, a full-stack developer.',
    url: 'https://sunnyparmar.com',
    siteName: 'Sunny Parmar',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="font-mono bg-themebg text-themetext" suppressHydrationWarning>
      <head>
        {/* Does not load in time if the next.js Script tag is used, causing a flash of the wrong style. */}
        <script dangerouslySetInnerHTML={{
          __html: `(function() {
        try {
          const savedMode = localStorage.getItem('theme-mode');
          const savedTheme = localStorage.getItem('theme-variant');

          if (savedMode) {
            document.documentElement.setAttribute('data-mode', savedMode);
          } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-mode', prefersDark ? 'dark' : 'light');
          }

          if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
          } else {
            document.documentElement.setAttribute('data-theme', 'gruvbox');
          }
        } catch (e) {}
  })();`,
        }}
        >
        </script>
      </head>
      <body>
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
