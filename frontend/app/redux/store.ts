import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import userReducer from './features/userSlice';

function loadPreloadedState() {
  try {
    const raw = localStorage.getItem('nestfind_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.user && parsed.isAuthenticated) {
        return {
          auth: {
            user: parsed.user,
            isAuthenticated: true,
            isLoading: false,
            authChecked: true,
            error: null,
          },
        };
      }
    }
  } catch {}
  return {};
}

export const store = configureStore({
  reducer: {
    auth: authReducer as any,
    users: userReducer,
  },
  preloadedState: loadPreloadedState(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
