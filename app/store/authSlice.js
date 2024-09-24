import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Asynchronous login action to get token
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (formData, { rejectWithValue }) => {
    try {
      // First, authenticate the user with email, password, and role
      const loginResponse = await fetch('https://doctorai-cw25.onrender.com/apis/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role, // Assuming role is part of the form data
        }),
      });

      const loginData = await loginResponse.json();

      // If login response is not OK, reject with the error message
      if (!loginResponse.ok) {
        const errorMessage = loginData?.detail || 'Login failed: Invalid credentials or role';
        return rejectWithValue(errorMessage);
      }

      // If the login is successful, fetch the token from /token/ endpoint
      const tokenResponse = await fetch('https://doctorai-cw25.onrender.com/apis/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.email, // Use email as username for token generation
          password: formData.password,
        }),
      });

      const tokenData = await tokenResponse.json();

      // If token response is not OK, reject with the error message
      if (!tokenResponse.ok) {
        const errorMessage = tokenData?.detail || 'Token fetch failed: Invalid credentials';
        return rejectWithValue(errorMessage);
      }

      // Return the token data along with user info if needed
      return {
        access: tokenData.access,
        refresh: tokenData.refresh,
        user: loginData.user, // Assuming loginData includes user information
      };

    } catch (error) {
      // If there is a network or other error, reject the promise
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  error: null,
};

// Check if running in a browser environment
if (typeof window !== 'undefined') {
  initialState.token = localStorage.getItem('token') || null;
  initialState.refreshToken = localStorage.getItem('refreshToken') || null;
  initialState.isAuthenticated = !!initialState.token; // true if token exists
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user; // Store user information
      state.token = action.payload.access; // Adjust according to the token structure
      state.isAuthenticated = true;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.access);
        localStorage.setItem('refreshToken', action.payload.refresh);
      }
    },
    loginFailure: (state, action) => {
      state.error = action.payload.error;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.user = action.payload.user; // Store user information
        state.isAuthenticated = true;
        state.error = null;
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', action.payload.access);
          localStorage.setItem('refreshToken', action.payload.refresh);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Login failed';
        state.isAuthenticated = false;
      });
  },
});

// Selectors
export const { logout, loginSuccess, loginFailure } = authSlice.actions;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user; // Selector for user information

export default authSlice.reducer;
