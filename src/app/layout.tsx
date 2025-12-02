import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { AuthGuard } from "@/components/auth-guard";
import { AppDataProvider } from "@/context/app-data";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Gestão Nordiun",
  description: "Gestão de técnicos, empresas e chamados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ToastProvider>
          <AppDataProvider>
            <AuthGuard>{children}</AuthGuard>
          </AppDataProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
