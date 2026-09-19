import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, EmptyState, ErrorState } from '../../components/Feedback';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { TableSkeleton } from '../../components/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { formatRole } from '../../utils/format';
import {
  clearUsersError,
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from './usersSlice';

const emptyCreateForm = {
  name: '',
  email: '',
  password: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const UsersPage = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const { items, status, error, mutationStatus, mutationError } = useSelector(
    (state) => state.users
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editForm, setEditForm] = useState({ name: '', email: '', isActive: true });
  const [formErrors, setFormErrors] = useState({});

  const editingAdmin = editTarget?.role === ROLES.ADMIN;

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const openCreate = () => {
    setCreateForm(emptyCreateForm);
    setFormErrors({});
    dispatch(clearUsersError());
    setCreateOpen(true);
  };

  const openEdit = (user) => {
    setEditTarget(user);
    setEditForm({
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    });
    setFormErrors({});
    dispatch(clearUsersError());
  };

  const validateCreate = () => {
    const next = {};
    if (!createForm.name.trim()) next.name = 'Name is required';
    if (!createForm.email.trim()) next.email = 'Email is required';
    else if (!emailPattern.test(createForm.email.trim())) next.email = 'Enter a valid email';
    if (!createForm.password || createForm.password.length < 8) {
      next.password = 'Password must be at least 8 characters';
    }
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateEdit = () => {
    const next = {};
    if (!editForm.name.trim()) next.name = 'Name is required';
    if (!editForm.email.trim()) next.email = 'Email is required';
    else if (!emailPattern.test(editForm.email.trim())) next.email = 'Enter a valid email';
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!validateCreate()) return;
    const result = await dispatch(
      createUser({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
      })
    );
    if (createUser.fulfilled.match(result)) {
      setCreateOpen(false);
      dispatch(fetchUsers());
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!validateEdit() || !editTarget) return;

    const payload = {
      name: editForm.name.trim(),
      email: editForm.email.trim(),
    };

    // Admin role/status cannot be changed by the API.
    if (!editingAdmin) {
      payload.isActive = editForm.isActive;
    }

    const result = await dispatch(
      updateUser({
        id: editTarget.id,
        payload,
      })
    );
    if (updateUser.fulfilled.match(result)) {
      setEditTarget(null);
      dispatch(fetchUsers());
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteUser(deleteTarget.id));
    if (deleteUser.fulfilled.match(result)) {
      setDeleteTarget(null);
    }
  };

  const canDelete = (user) =>
    user.role !== ROLES.ADMIN && user.id !== currentUser?.id;

  return (
    <div>
      <PageHeader
        title="Users"
        description="Create warehouse staff accounts and manage user details"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add warehouse staff
          </Button>
        }
      />

      {status === 'failed' ? (
        <ErrorState message={error} onRetry={() => dispatch(fetchUsers())} />
      ) : status === 'loading' || status === 'idle' ? (
        <TableSkeleton cols={5} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Create a warehouse staff account to get started."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add warehouse staff
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge tone={user.role === ROLES.ADMIN ? 'info' : 'neutral'}>
                      {formatRole(user.role)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {canDelete(user) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Delete ${user.name}`}
                          onClick={() => {
                            dispatch(clearUsersError());
                            setDeleteTarget(user);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={createOpen}
        title="Add warehouse staff"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="create-user-form" disabled={mutationStatus === 'loading'}>
              {mutationStatus === 'loading' ? 'Creating…' : 'Create'}
            </Button>
          </>
        }
      >
        <form id="create-user-form" className="space-y-4" onSubmit={handleCreate}>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            New accounts are created as Warehouse Staff.
          </p>
          <Input
            label="Name"
            name="name"
            value={createForm.name}
            error={formErrors.name}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={createForm.email}
            error={formErrors.email}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={createForm.password}
            error={formErrors.password}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          {mutationError ? <Alert tone="error">{mutationError}</Alert> : null}
        </form>
      </Modal>

      <Modal
        open={Boolean(editTarget)}
        title="Edit user"
        onClose={() => setEditTarget(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-user-form" disabled={mutationStatus === 'loading'}>
              {mutationStatus === 'loading' ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <form id="edit-user-form" className="space-y-4" onSubmit={handleUpdate}>
          <Input
            label="Name"
            name="editName"
            value={editForm.name}
            error={formErrors.name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Email"
            name="editEmail"
            type="email"
            value={editForm.email}
            error={formErrors.email}
            onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Role: <span className="font-medium text-slate-700 dark:text-slate-200">{formatRole(editTarget?.role)}</span>
          </p>
          {!editingAdmin ? (
            <Select
              label="Status"
              name="editStatus"
              value={editForm.isActive ? 'true' : 'false'}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, isActive: e.target.value === 'true' }))
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          ) : null}
          {mutationError ? <Alert tone="error">{mutationError}</Alert> : null}
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete user"
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
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong> (
          {deleteTarget?.email})? They will be removed from the list and will no longer be able to
          sign in.
        </p>
        {mutationError ? <Alert tone="error">{mutationError}</Alert> : null}
      </Modal>
    </div>
  );
};
