import type { Metadata } from "next";
import "./globals.css";
import { AgentationProvider } from "@/components/agentation/AgentationProvider";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "SecureSite Studio — Multi-tenant AI Website Builder",
  description: "Build, customize, and manage multiple professional websites from one secure platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-background text-text-primary">
        <ToastProvider>
          {children}
        </ToastProvider>
        <AgentationProvider />
      </body>
    </html>
  );
}

