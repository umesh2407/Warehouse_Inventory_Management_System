import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getDashboardSummaryRequest } from '../../services/dashboard.service';
import { getErrorMessage } from '../../utils/error';

export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getDashboardSummaryRequest();
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load dashboard'));
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    summary: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.summary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
