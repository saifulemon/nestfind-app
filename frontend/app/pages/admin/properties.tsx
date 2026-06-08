// @ts-nocheck
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Home } from 'lucide-react';
import { usePropertySearch, useDeleteProperty } from '~/hooks/api/useProperties';
import { PageHeader } from '~/components/ui/page-header';
import { DataTable, type DataTableColumn } from '~/components/ui/data-table';
import { Pagination } from '~/components/ui/pagination';
import { ConfirmDialog } from '~/components/ui/confirm-dialog';
import type { PropertyListItem, PropertySearchParams } from '~/types/api/property';

export default function AdminProperties() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const params: PropertySearchParams = {
    page,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(refreshKey ? { _t: refreshKey } : {}),
  };

  const { data, isLoading, isError, error } = usePropertySearch(params);
  const deleteProperty = useDeleteProperty();

  const properties: PropertyListItem[] = data?.items ?? [];
  const meta = data?.meta;

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteProperty.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        setRefreshKey((k) => k + 1);
      },
    });
  };

  const columns: DataTableColumn<PropertyListItem>[] = [
    {
      key: 'title',
      header: 'Property',
      render: (prop) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <Home className="h-4 w-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{prop.title}</p>
            <p className="text-xs text-muted-foreground capitalize">{prop.propertyType}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      className: 'tabular-nums',
      render: (prop) => (
        <span className="font-semibold text-foreground">${prop.price.toLocaleString()}</span>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      render: (prop) => (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{prop.bedrooms} bd</span>
          <span className="text-border">|</span>
          <span>{prop.bathrooms} ba</span>
          {prop.squareFeet ? (
            <>
              <span className="text-border">|</span>
              <span>{prop.squareFeet.toLocaleString()} ft²</span>
            </>
          ) : null}
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (prop) => (
        <span className="text-muted-foreground text-xs">{prop.address?.city || prop.addressCity}, {prop.address?.state || prop.addressState}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Listed',
      render: (prop) => (
        <span className="text-muted-foreground text-xs">
          {new Date(prop.createdAt).toLocaleDateString(undefined, {
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
      render: (prop) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            to={`/admin/properties/${prop.id}/edit`}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setDeleteTarget({ id: prop.id, title: prop.title })}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Properties" description="Create, edit, and manage property listings.">
        <Link
          to="/admin/properties/new"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add Property
        </Link>
      </PageHeader>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={properties}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as Error)?.message || 'Failed to load properties'}
        emptyMessage="No properties found. Create your first listing to get started."
      />

      {meta && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Property"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteProperty.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
