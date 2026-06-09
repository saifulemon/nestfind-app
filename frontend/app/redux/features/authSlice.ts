// @ts-nocheck
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { httpService } from '~/services/httpService';
import { resetChatNotifications } from '~/hooks/useChatNotifications';
import type { AuthState, AuthUser, LoginCredentials, RegisterCredentials } from '~/types/auth';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authChecked: false,
  error: null,
};

function loadSession(): AuthState {
  try {
    const raw = localStorage.getItem('nestfind_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.user && parsed.isAuthenticated) {
        return { ...initialState, ...parsed, authChecked: true, isLoading: false, error: null };
      }
    }
  } catch {}
  return initialState;
}

function saveSession(user: any) {
  try {
    localStorage.setItem('nestfind_auth', JSON.stringify({ user, isAuthenticated: !!user }));
  } catch {}
}

function clearSession() {
  try {
    localStorage.removeItem('nestfind_auth');
  } catch {}
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await httpService.post<{ user: AuthUser }>('/auth/login', credentials);
      saveSession(response.user);
      return response.user;
    } catch (error: unknown) { const message = error instanceof Error ? error.message : "Unknown error";
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await httpService.post<{ user: AuthUser }>('/auth/register', credentials);
      saveSession(response.user);
      return response.user;
    } catch (error: unknown) { const message = error instanceof Error ? error.message : "Unknown error";
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await httpService.get<{ user: AuthUser }>('/auth/me');
      saveSession(response.user);
      return response.user;
    } catch (error: unknown) { const message = error instanceof Error ? error.message : "Unknown error";
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await httpService.post('/auth/logout');
      clearSession();
      resetChatNotifications();
    } catch (error: unknown) { const message = error instanceof Error ? error.message : "Unknown error";
      clearSession();
      resetChatNotifications();
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    setAuthChecked(state) {
      state.authChecked = true;
    },
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.authChecked = true;
      state.error = null;
    },
    restoreSession(state) {
      const saved = loadSession();
      if (saved.isAuthenticated && saved.user) {
        state.user = saved.user;
        state.isAuthenticated = true;
        state.authChecked = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase("auth/clear" as any, (state) => { state.user = null; state.isAuthenticated = false; });
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.authChecked = true;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.authChecked = true;
        state.error = action.payload as string;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.authChecked = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.authChecked = true;
        state.user = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.authChecked = true;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.authChecked = true;
        state.user = null;
      });
  },
});

export const { clearAuthError, setAuthChecked, setUser, restoreSession } = authSlice.actions;
export default authSlice.reducer;
