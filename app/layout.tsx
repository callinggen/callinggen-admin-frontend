import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MockDataProvider } from "@/contexts/MockDataContext";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CallingGen Admin",
  description: "Admin portal for CallingGen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MockDataProvider>
            <div className="flex flex-col h-screen bg-background overflow-hidden">
              <Navbar />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                  <div className="mx-auto max-w-7xl">{children}</div>
                </main>
              </div>
            </div>
            <Toaster richColors position="top-right" />
          </MockDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
