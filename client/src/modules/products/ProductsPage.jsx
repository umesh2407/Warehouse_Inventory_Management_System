import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, EmptyState, ErrorState } from '../../components/Feedback';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { TableSkeleton } from '../../components/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency, formatNumber } from '../../utils/format';
import {
  clearProductsError,
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from './productsSlice';

const emptyForm = {
  name: '',
  sku: '',
  category: '',
  price: '',
  minimumStockLevel: '',
};

export const ProductsPage = () => {
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();
  const { items, pagination, status, error, mutationStatus, mutationError } = useSelector(
    (state) => state.products
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts({ search: debouncedSearch, page }));
  }, [dispatch, debouncedSearch, page]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    dispatch(clearProductsError());
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
      minimumStockLevel: String(product.minimumStockLevel),
    });
    setFormErrors({});
    dispatch(clearProductsError());
    setModalOpen(true);
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!editing && !form.sku.trim()) next.sku = 'SKU is required';
    if (!editing && !form.category.trim()) next.category = 'Category is required';
    if (form.price === '' || Number(form.price) < 0) next.price = 'Price must be 0 or greater';
    if (form.minimumStockLevel === '' || Number(form.minimumStockLevel) < 0) {
      next.minimumStockLevel = 'Minimum stock must be 0 or greater';
    }
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    let result;
    if (editing) {
      result = await dispatch(
        updateProduct({
          id: editing.id,
          payload: {
            name: form.name.trim(),
            price: Number(form.price),
            minimumStockLevel: Number(form.minimumStockLevel),
          },
        })
      );
    } else {
      result = await dispatch(
        createProduct({
          name: form.name.trim(),
          sku: form.sku.trim(),
          category: form.category.trim(),
          price: Number(form.price),
          minimumStockLevel: Number(form.minimumStockLevel),
        })
      );
    }

    if (createProduct.fulfilled.match(result) || updateProduct.fulfilled.match(result)) {
      setModalOpen(false);
      dispatch(fetchProducts({ search: debouncedSearch, page }));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteProduct(deleteTarget.id));
    if (deleteProduct.fulfilled.match(result)) {
      setDeleteTarget(null);
      dispatch(fetchProducts({ search: debouncedSearch, page }));
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        description="Browse and manage the product catalog"
        actions={
          isAdmin ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add product
            </Button>
          ) : null
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          label="Search"
          name="search"
          placeholder="Search by name or SKU"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {status === 'failed' ? (
        <ErrorState
          message={error}
          onRetry={() => dispatch(fetchProducts({ search: debouncedSearch, page }))}
        />
      ) : status === 'loading' || status === 'idle' ? (
        <TableSkeleton cols={isAdmin ? 6 : 5} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            search
              ? 'Try a different search term.'
              : isAdmin
                ? 'Create your first product to get started.'
                : 'No products are available yet.'
          }
          action={
            isAdmin && !search ? (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add product
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Min stock</th>
                  {isAdmin ? <th className="px-4 py-3 font-medium">Actions</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                      {product.name}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{product.sku}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {formatNumber(product.minimumStockLevel)}
                    </td>
                    {isAdmin ? (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              dispatch(clearProductsError());
                              setDeleteTarget(product);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
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
        open={modalOpen}
        title={editing ? 'Edit product' : 'Add product'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="product-form"
              disabled={mutationStatus === 'loading'}
            >
              {mutationStatus === 'loading' ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <form id="product-form" className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Name"
            name="name"
            value={form.name}
            error={formErrors.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          {!editing ? (
            <>
              <Input
                label="SKU"
                name="sku"
                value={form.sku}
                error={formErrors.sku}
                onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
              />
              <Input
                label="Category"
                name="category"
                value={form.category}
                error={formErrors.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              />
            </>
          ) : null}
          <Input
            label="Price"
            name="price"
            type="number"
            min="0"
            value={form.price}
            error={formErrors.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
          />
          <Input
            label="Minimum stock level"
            name="minimumStockLevel"
            type="number"
            min="0"
            value={form.minimumStockLevel}
            error={formErrors.minimumStockLevel}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, minimumStockLevel: e.target.value }))
            }
          />
          {mutationError ? <Alert tone="error">{mutationError}</Alert> : null}
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete product"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={mutationStatus === 'loading'}
            >
              {mutationStatus === 'loading' ? 'Deleting…' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This is blocked
          if the product still has stock.
        </p>
        {mutationError ? <Alert tone="error">{mutationError}</Alert> : null}
      </Modal>
    </div>
  );
};
