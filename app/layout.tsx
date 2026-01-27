import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { LOGO_URL } from "@/utils/constants";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#ff0050",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}


const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "NGL.ayooluwa",
  "alternateName": ["NGL ayooluwa", "NGL Ayooluwa Anonymous", "Anonymous Q&A"],
  "description": "Get anonymous messages from your friends, followers, and fans. The most premium anonymous messaging experience.",
  "url": "https://ngl.aayooluwa.com",
  "applicationCategory": "SocialNetworkingApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Person",
    "name": "Aduwo Ayooluwa",
    "url": "https://aayooluwa.com"
  },
  "publisher": {
    "@type": "Person",
    "name": "Aduwo Ayooluwa"
  },
  "potentialAction": [
    {
      "@type": "ViewAction",
      "name": "Get Started",
      "target": "https://ngl.aayooluwa.com/signup"
    },
    {
      "@type": "ViewAction",
      "name": "Login",
      "target": "https://ngl.aayooluwa.com/login"
    }
  ],
  "sameAs": [
    "https://twitter.com/codingpastor"
  ]
};

// Website structured data for sitelinks search box
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "NGL.ayooluwa",
  "url": "https://ngl.aayooluwa.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://ngl.aayooluwa.com/{username}"
    },
    "query-input": "required name=username"
  }
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ngl.aayooluwa.com"),
  title: {
    default: "NGL.ayooluwa | Anonymous Q&A - Send Anonymous Messages",
    template: "%s | NGL.ayooluwa"
  },
  description: "Get anonymous messages from your friends, followers, and fans. The most premium anonymous messaging experience. Create your link and start receiving honest feedback today!",
  applicationName: "NGL.ayooluwa",
  keywords: [
    "ngl", "anonymous", "questions", "messaging", "feedback", "social", "fun",
    "anonymous questions", "anonymous messaging", "confession", "ask me anything",
    "honest feedback", "q&a", "anonymous inbox", "ngl clone", "send anonymous message"
  ],
  authors: [{ name: "Aduwo Ayooluwa", url: "https://aayooluwa.com" }],
  creator: "Aduwo Ayooluwa",
  publisher: "Aduwo Ayooluwa",
  category: "Social",
  classification: "Social Networking",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://ngl.aayooluwa.com",
  },
  openGraph: {
    title: "NGL.ayooluwa | Ask Me Anything Anonymously",
    description: "Send me an anonymous message! 100% safe and private. The ultimate anonymous Q&A platform.",
    url: "https://ngl.aayooluwa.com", 
    siteName: "NGL.ayooluwa",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: LOGO_URL,
        width: 1200,
        height: 630,
        alt: "NGL.ayooluwa - Anonymous Q&A Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NGL.ayooluwa | Anonymous Q&A",
    description: "Send me anonymous messages! The most premium anonymous messaging experience.",
    creator: "@aduwoayooluwa",
    site: "@aduwoayooluwa",
    images: [LOGO_URL],
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon-192x192.png",
    apple: [
      { url: LOGO_URL, sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "format-detection": "telephone=no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data for Rich Results and Sitelinks */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={plusJakarta.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
