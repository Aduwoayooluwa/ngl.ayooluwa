import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#ff0050",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: "NGL.ayooluwa | Anonymous Q&A",
  description: "Get anonymous messages from your friends, followers, and fans. The most premium anonymous messaging experience.",
  applicationName: "NGL.ayooluwa",
  keywords: ["ngl", "anonymous", "questions", "messaging", "feedback", "social"],
  authors: [{ name: "Aduwo Ayooluwa" }],
  openGraph: {
    title: "NGL.ayooluwa | Ask Me Anything",
    description: "Send me an anonymous message! 100% safe and private.",
    url: "https://ngl.ayooluwa.com", 
    siteName: "NGL.ayooluwa",
    locale: "en_US",
    type: "website",
    images: [
        {
          url: 'https://ngl.ayooluwa.com/logo.svg',
          width: 800,
          height: 600,
          alt: 'NGL.ayooluwa Logo',
        },
      ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NGL.ayooluwa",
    description: "Send me anonymous messages!",
    creator: "@aduwoayooluwa", 
  },
  icons: {
    icon: "https://ngl.ayooluwa.com/logo.svg", 
    shortcut: "https://ngl.ayooluwa.com/logo.svg",
    apple: "https://ngl.ayooluwa.com/logo.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={plusJakarta.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
