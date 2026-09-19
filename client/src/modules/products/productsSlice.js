import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createProductRequest,
  deleteProductRequest,
  listProductsRequest,
  updateProductRequest,
} from '../../services/products.service';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../utils/constants';
import { getErrorMessage } from '../../utils/error';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await listProductsRequest({
        search: params.search || '',
        page: params.page || DEFAULT_PAGE,
        limit: params.limit || DEFAULT_LIMIT,
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load products'));
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await createProductRequest(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create product'));
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await updateProductRequest(id, payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update product'));
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await deleteProductRequest(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to delete product'));
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    pagination: { page: 1, limit: DEFAULT_LIMIT, total: 0, totalPages: 0 },
    status: 'idle',
    mutationStatus: 'idle',
    error: null,
    mutationError: null,
  },
  reducers: {
    clearProductsError(state) {
      state.error = null;
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createProduct.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      });
  },
});

export const { clearProductsError } = productsSlice.actions;
export default productsSlice.reducer;
