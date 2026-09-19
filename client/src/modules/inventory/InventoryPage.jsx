import { ArrowLeftRight, Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, EmptyState, ErrorState } from '../../components/Feedback';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { TableSkeleton } from '../../components/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import { formatNumber } from '../../utils/format';
import { fetchProducts } from '../products/productsSlice';
import { fetchWarehouses } from '../warehouses/warehousesSlice';
import {
  addStock,
  clearInventoryError,
  fetchInventory,
  fetchLowStock,
  removeStock,
  transferStock,
} from './inventorySlice';

const emptyStockForm = {
  productId: '',
  warehouseId: '',
  quantity: '',
};

const emptyTransferForm = {
  productId: '',
  sourceWarehouseId: '',
  destinationWarehouseId: '',
  quantity: '',
};

export const InventoryPage = () => {
  const dispatch = useDispatch();
  const { items, pagination, status, error, mutationStatus, mutationError, lowStock } =
    useSelector((state) => state.inventory);
  const products = useSelector((state) => state.products.items);
  const warehouses = useSelector((state) => state.warehouses.items);

  const [search, setSearch] = useState('');
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const [addOpen, setAddOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [stockForm, setStockForm] = useState(emptyStockForm);
  const [transferForm, setTransferForm] = useState(emptyTransferForm);
  const [formErrors, setFormErrors] = useState({});

  const lowStockIds = new Set(lowStock.map((item) => item.id));

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 100 }));
    dispatch(fetchWarehouses({ page: 1, limit: 100 }));
    dispatch(fetchLowStock());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchInventory({
        search: debouncedSearch,
        productId,
        warehouseId,
        page,
      })
    );
  }, [dispatch, debouncedSearch, productId, warehouseId, page]);

  const refreshList = () => {
    dispatch(
      fetchInventory({
        search: debouncedSearch,
        productId,
        warehouseId,
        page,
      })
    );
    dispatch(fetchLowStock());
  };

  const openAdd = () => {
    setStockForm(emptyStockForm);
    setFormErrors({});
    dispatch(clearInventoryError());
    setAddOpen(true);
  };

  const openRemove = () => {
    setStockForm(emptyStockForm);
    setFormErrors({});
    dispatch(clearInventoryError());
    setRemoveOpen(true);
  };

  const openTransfer = () => {
    setTransferForm(emptyTransferForm);
    setFormErrors({});
    dispatch(clearInventoryError());
    setTransferOpen(true);
  };

  const validateStock = () => {
    const next = {};
    if (!stockForm.productId) next.productId = 'Product is required';
    if (!stockForm.warehouseId) next.warehouseId = 'Warehouse is required';
    if (!stockForm.quantity || Number(stockForm.quantity) <= 0) {
      next.quantity = 'Quantity must be greater than 0';
    }
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateTransfer = () => {
    const next = {};
    if (!transferForm.productId) next.productId = 'Product is required';
    if (!transferForm.sourceWarehouseId) next.sourceWarehouseId = 'Source warehouse is required';
    if (!transferForm.destinationWarehouseId) {
      next.destinationWarehouseId = 'Destination warehouse is required';
    }
    if (
      transferForm.sourceWarehouseId &&
      transferForm.destinationWarehouseId &&
      transferForm.sourceWarehouseId === transferForm.destinationWarehouseId
    ) {
      next.destinationWarehouseId = 'Source and destination must be different';
    }
    if (!transferForm.quantity || Number(transferForm.quantity) <= 0) {
      next.quantity = 'Quantity must be greater than 0';
    }
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!validateStock()) return;
    const result = await dispatch(
      addStock({
        productId: stockForm.productId,
        warehouseId: stockForm.warehouseId,
        quantity: Number(stockForm.quantity),
      })
    );
    if (addStock.fulfilled.match(result)) {
      setAddOpen(false);
      refreshList();
    }
  };

  const handleRemove = async (event) => {
    event.preventDefault();
    if (!validateStock()) return;
    const result = await dispatch(
      removeStock({
        productId: stockForm.productId,
        warehouseId: stockForm.warehouseId,
        quantity: Number(stockForm.quantity),
      })
    );
    if (removeStock.fulfilled.match(result)) {
      setRemoveOpen(false);
      refreshList();
    }
  };

  const handleTransfer = async (event) => {
    event.preventDefault();
    if (!validateTransfer()) return;
    const result = await dispatch(
      transferStock({
        productId: transferForm.productId,
        sourceWarehouseId: transferForm.sourceWarehouseId,
        destinationWarehouseId: transferForm.destinationWarehouseId,
        quantity: Number(transferForm.quantity),
      })
    );
    if (transferStock.fulfilled.match(result)) {
      setTransferOpen(false);
      refreshList();
    }
  };

  const stockFormFields = (
    <>
      <Select
        label="Product"
        name="productId"
        value={stockForm.productId}
        error={formErrors.productId}
        onChange={(e) => setStockForm((prev) => ({ ...prev, productId: e.target.value }))}
      >
        <option value="">Select product</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} ({product.sku})
          </option>
        ))}
      </Select>
      <Select
        label="Warehouse"
        name="warehouseId"
        value={stockForm.warehouseId}
        error={formErrors.warehouseId}
        onChange={(e) => setStockForm((prev) => ({ ...prev, warehouseId: e.target.value }))}
      >
        <option value="">Select warehouse</option>
        {warehouses.map((warehouse) => (
          <option key={warehouse.id} value={warehouse.id}>
            {warehouse.name}
          </option>
        ))}
      </Select>
      <Input
        label="Quantity"
        name="quantity"
        type="number"
        min="1"
        value={stockForm.quantity}
        error={formErrors.quantity}
        onChange={(e) => setStockForm((prev) => ({ ...prev, quantity: e.target.value }))}
      />
    </>
  );

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="View stock levels and perform add, remove, or transfer operations"
        actions={
          <>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Add stock
            </Button>
            <Button variant="secondary" onClick={openRemove}>
              <Minus className="h-4 w-4" />
              Remove
            </Button>
            <Button variant="secondary" onClick={openTransfer}>
              <ArrowLeftRight className="h-4 w-4" />
              Transfer
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Input
          label="Search"
          name="search"
          placeholder="Search by product name or SKU"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          label="Product filter"
          name="productFilter"
          value={productId}
          onChange={(e) => {
            setProductId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All products</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </Select>
        <Select
          label="Warehouse filter"
          name="warehouseFilter"
          value={warehouseId}
          onChange={(e) => {
            setWarehouseId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All warehouses</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </Select>
      </div>

      {status === 'failed' ? (
        <ErrorState message={error} onRetry={refreshList} />
      ) : status === 'loading' || status === 'idle' ? (
        <TableSkeleton cols={5} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No inventory records"
          description="Add stock to a warehouse to create inventory records."
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Add stock
            </Button>
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Warehouse</th>
                  <th className="px-4 py-3 font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Min stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((row) => {
                  const isLow = lowStockIds.has(row.productId);
                  return (
                    <tr
                      key={row.id}
                      className={isLow ? 'bg-amber-50/50 dark:bg-amber-950/20' : undefined}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          {row.product?.name || '—'}
                          {isLow ? <Badge tone="warning">Low</Badge> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {row.product?.sku || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {row.warehouse?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {formatNumber(row.quantity)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {formatNumber(row.product?.minimumStockLevel ?? 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <Modal
        open={addOpen}
        title="Add stock"
        onClose={() => setAddOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-stock-form" disabled={mutationStatus === 'loading'}>
              {mutationStatus === 'loading' ? 'Saving…' : 'Add stock'}
            </Button>
          </>
        }
      >
        <form id="add-stock-form" className="space-y-4" onSubmit={handleAdd}>
          {stockFormFields}
          {mutationError ? <Alert tone="error">{mutationError}</Alert> : null}
        </form>
      </Modal>

      <Modal
        open={removeOpen}
        title="Remove stock"
        onClose={() => setRemoveOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoveOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="remove-stock-form" disabled={mutationStatus === 'loading'}>
              {mutationStatus === 'loading' ? 'Saving…' : 'Remove stock'}
            </Button>
          </>
        }
      >
        <form id="remove-stock-form" className="space-y-4" onSubmit={handleRemove}>
          {stockFormFields}
          {mutationError ? <Alert tone="error">{mutationError}</Alert> : null}
        </form>
      </Modal>

      <Modal
        open={transferOpen}
        title="Transfer stock"
        onClose={() => setTransferOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTransferOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="transfer-stock-form"
              disabled={mutationStatus === 'loading'}
            >
              {mutationStatus === 'loading' ? 'Transferring…' : 'Transfer'}
            </Button>
          </>
        }
      >
        <form id="transfer-stock-form" className="space-y-4" onSubmit={handleTransfer}>
          <Select
            label="Product"
            name="transferProductId"
            value={transferForm.productId}
            error={formErrors.productId}
            onChange={(e) =>
              setTransferForm((prev) => ({ ...prev, productId: e.target.value }))
            }
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </option>
            ))}
          </Select>
          <Select
            label="Source warehouse"
            name="sourceWarehouseId"
            value={transferForm.sourceWarehouseId}
            error={formErrors.sourceWarehouseId}
            onChange={(e) =>
              setTransferForm((prev) => ({ ...prev, sourceWarehouseId: e.target.value }))
            }
          >
            <option value="">Select source</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </Select>
          <Select
            label="Destination warehouse"
            name="destinationWarehouseId"
            value={transferForm.destinationWarehouseId}
            error={formErrors.destinationWarehouseId}
            onChange={(e) =>
              setTransferForm((prev) => ({
                ...prev,
                destinationWarehouseId: e.target.value,
              }))
            }
          >
            <option value="">Select destination</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </Select>
          <Input
            label="Quantity"
            name="transferQuantity"
            type="number"
            min="1"
            value={transferForm.quantity}
            error={formErrors.quantity}
            onChange={(e) =>
              setTransferForm((prev) => ({ ...prev, quantity: e.target.value }))
            }
          />
          {mutationError ? <Alert tone="error">{mutationError}</Alert> : null}
        </form>
      </Modal>
    </div>
  );
};
