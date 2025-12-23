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
const logoUrl = "https://res.cloudinary.com/ddztldkdq/image/upload/v1766517150/logo_ixwnnf.png";

export const metadata: Metadata = {
  title: "NGL.ayooluwa | Anonymous Q&A",
  description: "Get anonymous messages from your friends, followers, and fans. The most premium anonymous messaging experience.",
  applicationName: "NGL.ayooluwa",
  keywords: ["ngl", "anonymous", "questions", "messaging", "feedback", "social", "fun"],
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
          url: logoUrl,
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
    icon: logoUrl, 
    shortcut: logoUrl,
    apple: logoUrl,
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
