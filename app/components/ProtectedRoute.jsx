'use client';

import { useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
   

  useEffect(() => {
    // Check if the user is authenticated
    if (!isAuthenticated) {
      // Store the last visited page before redirecting
      sessionStorage.setItem('lastPage', window.location.pathname);
      router.push('/auth/login');
    } else {
      // Redirect to the last visited page after login if it exists
      const lastPage = sessionStorage.getItem('lastPage');
      if (lastPage) {
        router.push(lastPage);
        sessionStorage.removeItem('lastPage'); // Clear it after using
      }
    }
  }, [isAuthenticated, router]);

  // Show a loading state while checking authentication
  // if (!isAuthenticated) {
  //   return null; // Optionally, return a loading spinner or similar
  // }
  const [currentPage, setCurrentPage] = useState("Home"); // Default value for server-side
  const [isMounted, setIsMounted] = useState(false); // To check if component has mounted

  useEffect(() => {
    // This will run only on the client
    setIsMounted(true);
    const savedPage = localStorage.getItem('currentPage');
    if (savedPage) {
      setCurrentPage(savedPage); // Update state if there's a saved page
    }
  }, []);

  const navigateToPage = (page) => {
    setCurrentPage(page);
    localStorage.setItem('currentPage', page); // Save the current page to localStorage
  };

  if (!isMounted) {
    return null; // Prevent rendering on server
  }


  return <>
   <a onClick={() => navigateToPage("Home")}></a>
   <a onClick={() => navigateToPage("Make Appointment")}></a>
  {children || lastPage}
   </>; // Render children if authenticated
};

export default ProtectedRoute;
