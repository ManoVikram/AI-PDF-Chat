import "./globals.css";

export const metadata = {
  title: "AI PDF Chat RAG",
  description: "Chat with your PDF using AI and Retrieval-Augmented Generation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
