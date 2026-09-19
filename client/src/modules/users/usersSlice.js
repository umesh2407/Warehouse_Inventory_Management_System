import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createUserRequest,
  deactivateUserRequest,
  listUsersRequest,
  updateUserRequest,
} from '../../services/users.service';
import { getErrorMessage } from '../../utils/error';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await listUsersRequest();
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load users'));
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await createUserRequest(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create user'));
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await updateUserRequest(id, payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update user'));
    }
  }
);

export const deactivateUser = createAsyncThunk(
  'users/deactivateUser',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await deactivateUserRequest(id);
      return data.data || { id };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to deactivate user'));
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    status: 'idle',
    mutationStatus: 'idle',
    error: null,
    mutationError: null,
  },
  reducers: {
    clearUsersError(state) {
      state.error = null;
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(createUser.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      })
      .addCase(deactivateUser.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(deactivateUser.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      });
  },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
