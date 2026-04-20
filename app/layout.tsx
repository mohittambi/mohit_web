import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CONTACT_PHONE_E164, CONTACT_EMAIL } from "@/data/blog/site";
import { CopyGuard } from "@/components/ui/CopyGuard";

const display = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const code = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-code",
  display: "swap",
  weight: ["400", "500", "600"],
});

const SITE_URL = "https://mohittambi.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mohit Tambi — Principal Engineer | Distributed Systems & Cloud Architecture",
    template: "%s | Mohit Tambi",
  },
  description:
    "Principal Engineer with 10+ years designing cloud-native distributed systems. Serving 7M+ users at 99.99% uptime. Deep expertise in AWS, Node.js, TypeScript, microservices, event-driven architecture, and AI/ML integration.",
  keywords: [
    "Principal Engineer India",
    "Platform Architect",
    "Distributed Systems Engineer",
    "AWS Cloud Architecture",
    "Node.js TypeScript Engineer",
    "Microservices Architecture",
    "Event-Driven Systems",
    "Staff Engineer",
    "Backend Engineer Hyderabad",
    "RAG LLM Engineering",
    "DynamoDB Architecture",
    "Serverless ECS Migration",
  ],
  authors: [{ name: "Mohit Tambi", url: SITE_URL }],
  creator: "Mohit Tambi",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Mohit Tambi",
    title: "Mohit Tambi — Principal Engineer | Distributed Systems & Cloud",
    description:
      "Platform Architect designing cloud-native distributed systems for 7M+ users. 10+ years in AWS, Node.js, microservices, and AI-enabled engineering.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mohit Tambi — Principal Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mohit Tambi — Principal Engineer",
    description:
      "Platform Architect designing cloud-native distributed systems for 7M+ users. 10+ years in AWS, Node.js, microservices.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Mohit Tambi",
  jobTitle: "Principal Engineer",
  description:
    "Platform Architect and Engineering Leader with 10+ years designing cloud-native distributed systems serving 7M+ users.",
  url: SITE_URL,
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONE_E164,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Hyderabad",
    addressCountry: "IN",
  },
  sameAs: [
    "https://www.linkedin.com/in/mohit-tambi/",
    "https://github.com/mohittambi",
    "https://medium.com/@er.mohittambi",
  ],
  knowsAbout: [
    "Distributed Systems",
    "Cloud Architecture",
    "AWS",
    "Node.js",
    "TypeScript",
    "Microservices",
    "Event-Driven Architecture",
    "DynamoDB",
    "Serverless Computing",
    "RAG",
    "LLM Engineering",
    "Platform Engineering",
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Government Engineering College, Ajmer",
  },
  worksFor: {
    "@type": "Organization",
    name: "i2b Technologies Pvt. Ltd.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${code.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <ThemeProvider>
          <CopyGuard />
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
