import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, EmptyState, ErrorState } from '../../components/Feedback';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { TableSkeleton } from '../../components/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { formatNumber } from '../../utils/format';
import {
  clearWarehousesError,
  createWarehouse,
  deleteWarehouse,
  fetchWarehouses,
  updateWarehouse,
} from './warehousesSlice';

const emptyForm = { name: '', location: '', capacity: '' };

export const WarehousesPage = () => {
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();
  const { items, pagination, status, error, mutationStatus, mutationError } = useSelector(
    (state) => state.warehouses
  );

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchWarehouses({ page }));
  }, [dispatch, page]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    dispatch(clearWarehousesError());
    setModalOpen(true);
  };

  const openEdit = (warehouse) => {
    setEditing(warehouse);
    setForm({
      name: warehouse.name,
      location: warehouse.location,
      capacity: String(warehouse.capacity),
    });
    setFormErrors({});
    dispatch(clearWarehousesError());
    setModalOpen(true);
  };

  const validate = () => {
    const next = {};
    if (!editing && !form.name.trim()) next.name = 'Name is required';
    if (!form.location.trim()) next.location = 'Location is required';
    if (form.capacity === '' || Number(form.capacity) < 0) {
      next.capacity = 'Capacity must be 0 or greater';
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
        updateWarehouse({
          id: editing.id,
          payload: {
            location: form.location.trim(),
            capacity: Number(form.capacity),
          },
        })
      );
    } else {
      result = await dispatch(
        createWarehouse({
          name: form.name.trim(),
          location: form.location.trim(),
          capacity: Number(form.capacity),
        })
      );
    }

    if (createWarehouse.fulfilled.match(result) || updateWarehouse.fulfilled.match(result)) {
      setModalOpen(false);
      dispatch(fetchWarehouses({ page }));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteWarehouse(deleteTarget.id));
    if (deleteWarehouse.fulfilled.match(result)) {
      setDeleteTarget(null);
      dispatch(fetchWarehouses({ page }));
    }
  };

  return (
    <div>
      <PageHeader
        title="Warehouses"
        description="View warehouse locations and capacity"
        actions={
          isAdmin ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add warehouse
            </Button>
          ) : null
        }
      />

      {status === 'failed' ? (
        <ErrorState message={error} onRetry={() => dispatch(fetchWarehouses({ page }))} />
      ) : status === 'loading' || status === 'idle' ? (
        <TableSkeleton cols={isAdmin ? 4 : 3} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No warehouses yet"
          description={
            isAdmin
              ? 'Create a warehouse to start storing inventory.'
              : 'No warehouses are available yet.'
          }
          action={
            isAdmin ? (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add warehouse
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
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Capacity</th>
                  {isAdmin ? <th className="px-4 py-3 font-medium">Actions</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((warehouse) => (
                  <tr key={warehouse.id}>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                      {warehouse.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {warehouse.location}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {formatNumber(warehouse.capacity)}
                    </td>
                    {isAdmin ? (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(warehouse)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              dispatch(clearWarehousesError());
                              setDeleteTarget(warehouse);
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
        title={editing ? 'Edit warehouse' : 'Add warehouse'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="warehouse-form" disabled={mutationStatus === 'loading'}>
              {mutationStatus === 'loading' ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <form id="warehouse-form" className="space-y-4" onSubmit={handleSubmit}>
          {!editing ? (
            <Input
              label="Name"
              name="name"
              value={form.name}
              error={formErrors.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          ) : (
            <p className="text-sm text-slate-500">
              Name: <span className="font-medium text-slate-800 dark:text-slate-200">{editing.name}</span>
            </p>
          )}
          <Input
            label="Location"
            name="location"
            value={form.location}
            error={formErrors.location}
            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
          />
          <Input
            label="Capacity"
            name="capacity"
            type="number"
            min="0"
            value={form.capacity}
            error={formErrors.capacity}
            onChange={(e) => setForm((prev) => ({ ...prev, capacity: e.target.value }))}
          />
          {mutationError ? <Alert tone="error">{mutationError}</Alert> : null}
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete warehouse"
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
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This is blocked if
          the warehouse still has stock.
        </p>
        {mutationError ? <Alert tone="error">{mutationError}</Alert> : null}
      </Modal>
    </div>
  );
};
