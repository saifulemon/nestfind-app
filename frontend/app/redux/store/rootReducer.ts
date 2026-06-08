import { combineReducers } from '@reduxjs/toolkit';
import userReducer from '~/redux/features/userSlice';
import authReducer from '~/redux/features/authSlice';

const rootReducer = combineReducers({
  user: userReducer,
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
