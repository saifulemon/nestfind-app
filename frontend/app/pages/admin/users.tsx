// @ts-nocheck
import { useState } from 'react';
import { UserX, UserCheck, Plus, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAdminUserList, useUpdateUserStatus, useCreateUser } from '~/hooks/api/useAdmin';
import { PageHeader } from '~/components/ui/page-header';
import { DataTable, type DataTableColumn } from '~/components/ui/data-table';
import { Pagination } from '~/components/ui/pagination';
import { ConfirmDialog } from '~/components/ui/confirm-dialog';
import type { AdminUser } from '~/types/api/admin';

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showOnboard, setShowOnboard] = useState(false);
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('renter');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const { data, isLoading, isError, error } = useAdminUserList({
    page,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    ...(search ? { search } : {}),
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(refreshKey ? { _t: refreshKey } : {}),
  });
  const updateStatus = useUpdateUserStatus();
  const createUser = useCreateUser();

  const users: AdminUser[] = data?.items ?? [];
  const meta = data?.meta;

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('renter');
    setFormPassword('');
    setFormError('');
  };

  const openOnboard = () => {
    resetForm();
    setShowOnboard(true);
  };

  const handleOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    createUser.mutate(
      { name: formName, email: formEmail, role: formRole, password: formPassword },
      {
        onSuccess: () => {
          setShowOnboard(false);
          resetForm();
          setRefreshKey((k) => k + 1);
        },
        onError: (err) => setFormError(err.message),
      }
    );
  };

  const handleStatusToggle = () => {
    if (!statusTarget) return;
    const newStatus = statusTarget.status === 'active' ? 'suspended' : 'active';
    updateStatus.mutate(
      { id: statusTarget.id, data: { status: newStatus } },
      {
        onSuccess: () => {
          setStatusTarget(null);
          setRefreshKey((k) => k + 1);
        },
      }
    );
  };

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: 'name',
      header: 'User',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            {(user.name || user.email)[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
          user.role === 'admin'
            ? 'bg-violet-500/10 text-violet-400'
            : 'bg-blue-500/10 text-blue-400'
        }`}>
          {user.role}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
          user.status === 'active'
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-destructive/10 text-destructive'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${
            user.status === 'active' ? 'bg-emerald-400' : 'bg-destructive'
          }`} />
          {user.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (user) => (
        <span className="text-muted-foreground text-xs">
          {new Date(user.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (user) => {
        const isActive = user.status === 'active';
        return (
          <button
            type="button"
            onClick={() => setStatusTarget(user)}
            disabled={updateStatus.isPending}
            className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 ${
              isActive
                ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
            }`}
          >
            {isActive ? (
              <><UserX className="h-3.5 w-3.5" /> Suspend</>
            ) : (
              <><UserCheck className="h-3.5 w-3.5" /> Activate</>
            )}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="View and manage registered users.">
        <button
          type="button"
          onClick={openOnboard}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Onboard User
        </button>
      </PageHeader>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="renter">Renter</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as Error)?.message || 'Failed to load users'}
        emptyMessage="No users found."
      />

      {meta && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={setPage}
        />
      )}

      {showOnboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => !createUser.isPending && setShowOnboard(false)}
          />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Onboard New User</h3>
              <button
                type="button"
                onClick={() => !createUser.isPending && setShowOnboard(false)}
                disabled={createUser.isPending}
                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleOnboard} className="px-6 py-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                >
                  <option value="renter">Renter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Min 8 chars, letters + numbers"
                    required
                    minLength={8}
                    maxLength={128}
                    className="w-full h-10 rounded-lg border border-border bg-background pl-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Must contain at least 1 letter and 1 number</p>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOnboard(false)}
                  disabled={createUser.isPending}
                  className="inline-flex items-center justify-center h-9 px-4 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUser.isPending}
                  className="inline-flex items-center gap-1.5 justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {createUser.isPending ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating...</>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!statusTarget}
        title={statusTarget?.status === 'active' ? 'Suspend User' : 'Activate User'}
        message={
          statusTarget?.status === 'active'
            ? `Are you sure you want to suspend "${statusTarget?.name}"? They will no longer be able to log in.`
            : `Are you sure you want to reactivate "${statusTarget?.name}"? They will regain full access.`
        }
        confirmLabel={statusTarget?.status === 'active' ? 'Suspend' : 'Activate'}
        variant="danger"
        isLoading={updateStatus.isPending}
        onConfirm={handleStatusToggle}
        onCancel={() => setStatusTarget(null)}
      />
    </div>
  );
}
