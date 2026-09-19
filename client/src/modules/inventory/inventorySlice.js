import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  addStockRequest,
  getLowStockRequest,
  listInventoryRequest,
  removeStockRequest,
  transferStockRequest,
} from '../../services/inventory.service';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../utils/constants';
import { getErrorMessage, rejectMutationError } from '../../utils/error';

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = {
        page: params.page || DEFAULT_PAGE,
        limit: params.limit || DEFAULT_LIMIT,
      };

      if (params.productId) query.productId = params.productId;
      if (params.warehouseId) query.warehouseId = params.warehouseId;
      if (params.search) query.search = params.search;

      const { data } = await listInventoryRequest(query);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load inventory'));
    }
  }
);

export const fetchLowStock = createAsyncThunk(
  'inventory/fetchLowStock',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getLowStockRequest();
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load low stock'));
    }
  }
);

export const addStock = createAsyncThunk(
  'inventory/addStock',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await addStockRequest(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(rejectMutationError(error, 'Failed to add stock'));
    }
  }
);

export const removeStock = createAsyncThunk(
  'inventory/removeStock',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await removeStockRequest(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(rejectMutationError(error, 'Failed to remove stock'));
    }
  }
);

export const transferStock = createAsyncThunk(
  'inventory/transferStock',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await transferStockRequest(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(rejectMutationError(error, 'Failed to transfer stock'));
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: [],
    lowStock: [],
    pagination: { page: 1, limit: DEFAULT_LIMIT, total: 0, totalPages: 0 },
    status: 'idle',
    lowStockStatus: 'idle',
    mutationStatus: 'idle',
    error: null,
    lowStockError: null,
    mutationError: null,
  },
  reducers: {
    clearInventoryError(state) {
      state.error = null;
      state.mutationError = null;
      state.lowStockError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchLowStock.pending, (state) => {
        state.lowStockStatus = 'loading';
        state.lowStockError = null;
      })
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.lowStockStatus = 'succeeded';
        state.lowStock = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchLowStock.rejected, (state, action) => {
        state.lowStockStatus = 'failed';
        state.lowStockError = action.payload;
      })
      .addCase(addStock.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(addStock.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(addStock.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      })
      .addCase(removeStock.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(removeStock.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(removeStock.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      })
      .addCase(transferStock.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(transferStock.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(transferStock.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      });
  },
});

export const { clearInventoryError } = inventorySlice.actions;
export default inventorySlice.reducer;
