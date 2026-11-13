import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus | Operations",
  description: "Nexus Headquarters operations dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <main className="app-backdrop">{children}</main>
      </body>
    </html>
  );
}
