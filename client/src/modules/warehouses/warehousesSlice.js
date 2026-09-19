import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createWarehouseRequest,
  deleteWarehouseRequest,
  listWarehousesRequest,
  updateWarehouseRequest,
} from '../../services/warehouses.service';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../utils/constants';
import { getErrorMessage } from '../../utils/error';

export const fetchWarehouses = createAsyncThunk(
  'warehouses/fetchWarehouses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await listWarehousesRequest({
        page: params.page || DEFAULT_PAGE,
        limit: params.limit || DEFAULT_LIMIT,
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load warehouses'));
    }
  }
);

export const createWarehouse = createAsyncThunk(
  'warehouses/createWarehouse',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await createWarehouseRequest(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create warehouse'));
    }
  }
);

export const updateWarehouse = createAsyncThunk(
  'warehouses/updateWarehouse',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await updateWarehouseRequest(id, payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update warehouse'));
    }
  }
);

export const deleteWarehouse = createAsyncThunk(
  'warehouses/deleteWarehouse',
  async (id, { rejectWithValue }) => {
    try {
      await deleteWarehouseRequest(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to delete warehouse'));
    }
  }
);

const warehousesSlice = createSlice({
  name: 'warehouses',
  initialState: {
    items: [],
    pagination: { page: 1, limit: DEFAULT_LIMIT, total: 0, totalPages: 0 },
    status: 'idle',
    mutationStatus: 'idle',
    error: null,
    mutationError: null,
  },
  reducers: {
    clearWarehousesError(state) {
      state.error = null;
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createWarehouse.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(createWarehouse.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(createWarehouse.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      })
      .addCase(updateWarehouse.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(updateWarehouse.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(updateWarehouse.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      })
      .addCase(deleteWarehouse.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(deleteWarehouse.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteWarehouse.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      });
  },
});

export const { clearWarehousesError } = warehousesSlice.actions;
export default warehousesSlice.reducer;
