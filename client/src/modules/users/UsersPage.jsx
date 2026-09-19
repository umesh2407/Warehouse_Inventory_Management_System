import { Pencil, Plus, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, EmptyState, ErrorState } from '../../components/Feedback';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { TableSkeleton } from '../../components/Skeleton';
import { ROLES } from '../../utils/constants';
import { formatRole } from '../../utils/format';
import {
  clearUsersError,
  createUser,
  deactivateUser,
  fetchUsers,
  updateUser,
} from './usersSlice';

const emptyCreateForm = {
  name: '',
  email: '',
  password: '',
  role: ROLES.WAREHOUSE_STAFF,
};

export const UsersPage = () => {
  const dispatch = useDispatch();
  const { items, status, error, mutationStatus, mutationError } = useSelector(
    (state) => state.users
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editForm, setEditForm] = useState({ name: '', role: '', isActive: true });
  const [formErrors, setFormErrors] = useState({});

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
      role: user.role,
      isActive: user.isActive,
    });
    setFormErrors({});
    dispatch(clearUsersError());
  };

  const validateCreate = () => {
    const next = {};
    if (!createForm.name.trim()) next.name = 'Name is required';
    if (!createForm.email.trim()) next.email = 'Email is required';
    if (!createForm.password || createForm.password.length < 8) {
      next.password = 'Password must be at least 8 characters';
    }
    if (![ROLES.ADMIN, ROLES.WAREHOUSE_STAFF].includes(createForm.role)) {
      next.role = 'Role is required';
    }
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateEdit = () => {
    const next = {};
    if (!editForm.name.trim()) next.name = 'Name is required';
    if (![ROLES.ADMIN, ROLES.WAREHOUSE_STAFF].includes(editForm.role)) {
      next.role = 'Role is required';
    }
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
        role: createForm.role,
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
    const result = await dispatch(
      updateUser({
        id: editTarget.id,
        payload: {
          name: editForm.name.trim(),
          role: editForm.role,
          isActive: editForm.isActive,
        },
      })
    );
    if (updateUser.fulfilled.match(result)) {
      setEditTarget(null);
      dispatch(fetchUsers());
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    const result = await dispatch(deactivateUser(deactivateTarget.id));
    if (deactivateUser.fulfilled.match(result)) {
      setDeactivateTarget(null);
      dispatch(fetchUsers());
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="Create and manage admin and warehouse staff accounts"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add user
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
              Add user
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
                      {user.isActive ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            dispatch(clearUsersError());
                            setDeactivateTarget(user);
                          }}
                        >
                          <UserX className="h-4 w-4 text-rose-500" />
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
        title="Add user"
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
          <Select
            label="Role"
            name="role"
            value={createForm.role}
            error={formErrors.role}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, role: e.target.value }))}
          >
            <option value={ROLES.WAREHOUSE_STAFF}>Warehouse Staff</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </Select>
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
          <Select
            label="Role"
            name="editRole"
            value={editForm.role}
            error={formErrors.role}
            onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
          >
            <option value={ROLES.WAREHOUSE_STAFF}>Warehouse Staff</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </Select>
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
          {mutationError ? <Alert tone="error">{mutationError}</Alert> : null}
        </form>
      </Modal>

      <Modal
        open={Boolean(deactivateTarget)}
        title="Deactivate user"
        onClose={() => setDeactivateTarget(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeactivateTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeactivate}
              disabled={mutationStatus === 'loading'}
            >
              {mutationStatus === 'loading' ? 'Deactivating…' : 'Deactivate'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Deactivate <strong>{deactivateTarget?.name}</strong>? They will no longer be able to sign
          in.
        </p>
        {mutationError ? <Alert tone="error">{mutationError}</Alert> : null}
      </Modal>
    </div>
  );
};
