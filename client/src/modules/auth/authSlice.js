import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getMeRequest, loginRequest, logoutRequest } from '../../services/auth.service';
import { getErrorMessage, rejectMutationError } from '../../utils/error';
import { clearAuthToken, getAuthToken, setAuthToken } from '../../utils/cookies';

const storedToken = getAuthToken();

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await loginRequest(credentials);
    return data.data;
  } catch (error) {
    return rejectWithValue(rejectMutationError(error, 'Invalid email or password'));
  }
});

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getMeRequest();
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Session expired'));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await logoutRequest();
  } catch {
    // Client still clears local session even if logout API fails.
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: storedToken,
    status: 'idle',
    bootstrapStatus: storedToken ? 'loading' : 'idle',
    error: null,
  },
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bootstrapStatus = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        setAuthToken(action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.bootstrapStatus = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.bootstrapStatus = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.bootstrapStatus = 'failed';
        state.user = null;
        state.token = null;
        clearAuthToken();
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
        state.bootstrapStatus = 'idle';
        state.error = null;
        clearAuthToken();
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
