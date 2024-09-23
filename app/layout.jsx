import localFont from "next/font/local";
import "./globals.css";
import Nav from '@components/Nav';
import ClientProvider from 'app/CloudProvider'; // Import the ClientProvider
import TokenRefreshHandler from './components/TokenRefreshHandler';
import ClientSessionProvider from './components/ClientSessionProvider'; // Import the new component

export const metadata = {
  title: "Doctor AI - Your Virtual Healthcare Assistant",
  description: "AI-driven medical diagnostics and consultations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`bg-gray-50 text-gray-800 antialiased`}>
        <ClientProvider>
          <TokenRefreshHandler />
          <ClientSessionProvider>
            <div className="min-h-screen flex flex-col">
              {/* Navbar */}
              <header className="bg-blue-600 text-white shadow-md">
                <div className="container mx-auto py-4 px-6">
                  <Nav />
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-grow container mx-auto py-8 px-6">
                {children}
              </main>

              {/* Footer */}
              <footer className="bg-gray-800 text-gray-200 py-4">
                <div className="container mx-auto text-center">
                  <p>&copy; {new Date().getFullYear()} Doctor AI. All Rights Reserved.</p>
                </div>
              </footer>
            </div>
          </ClientSessionProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
