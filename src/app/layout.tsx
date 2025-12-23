import "~/styles/globals.css";

import { type Metadata } from "next";
import Header from "./components/header";

export const metadata: Metadata = {
  title: 'Sunny Parmar | Full-Stack Developer',
  description: 'The personal portfolio of Sunny Parmar, a full-stack developer.',
  keywords: ['Sunny Parmar', 'Full-Stack Developer', 'Portfolio', 'Web Developer'],
  authors: [{ name: 'Sunny Parmar' }],
  creator: 'Sunny Parmar',
  icons: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👋</text></svg>",
  openGraph: {
    title: 'Sunny Parmar - Personal Site',
    description: 'Portfolio of Sunny Parmar, a full-stack developer.',
    url: 'https://sunnyparmar.com',
    siteName: 'Sunny Parmar',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="font-mono bg-themebg text-themetext">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
