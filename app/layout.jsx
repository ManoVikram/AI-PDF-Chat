import "./globals.css";
import { Open_Sans, Pirata_One } from "next/font/google";

export const metadata = {
  title: "Cursed Docs",
  description: "Chat with your PDF using AI and Retrieval-Augmented Generation",
};

const openSans = Open_Sans({subsets: ["latin"], variable: "--font-open-sans"});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${openSans.variable}`}>
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
