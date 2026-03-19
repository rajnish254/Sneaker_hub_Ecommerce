'use client';

import Navigation from './components/Navigation';
import Footer from './components/Footer';
import RootInitializer from './RootInitializer';
import { usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Pages that have their own Navigation/Footer handling
  const excludePaths = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password'];
  const shouldExcludeLayout = excludePaths.some(path => pathname?.startsWith(path));

  return (
    <>
      <RootInitializer />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={
          {
            '--toastify-color-dark': '#1a2332',
            '--toastify-color-light': '#3d4f62',
            '--toastify-text-color-light': '#bfc8e6',
          } as any
        }
      />
      {!shouldExcludeLayout && <Navigation />}
      <main className="min-h-screen">
        {children}
      </main>
      {!shouldExcludeLayout && <Footer />}
    </>
  );
}
