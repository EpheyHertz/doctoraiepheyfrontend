'use client';

import { useState } from 'react';
import axios from 'axios';

const PasswordResetRequest = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);  // State to track loading status

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);  // Set loading to true when the form is submitted
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://doctorai-cw25.onrender.com';
      const response = await axios.post(`${apiUrl}/apis/password-reset-request/`, { email });
      alert(response.data.message);
      setEmail('');  // Clear the email input after submission
    } catch (error) {
      if (error.response) {
        console.error('Server Error:', error.response.data);
        alert(error.response.data.error || 'Server Error');
      } else if (error.request) {
        console.error('Network Error:', error.request);
        alert('Network Error: Please check your connection.');
      } else {
        console.error('Error:', error.message);
        alert('Error: ' + error.message);
      }
    } finally {
      setLoading(false);  // Set loading to false once the process is done
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Reset Your Password</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-600 font-medium mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}  // Disable the button when loading
            className={`w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}  {/* Show 'Sending...' while loading */}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetRequest;
