// @ts-nocheck
import { useState } from 'react';
import { Eye, MessageCircle, Send, X, Loader2, Trash2, User } from 'lucide-react';
import { useInquiryList } from '~/hooks/api/useInquiries';
import { PageHeader } from '~/components/ui/page-header';
import { DataTable, type DataTableColumn } from '~/components/ui/data-table';
import { Pagination } from '~/components/ui/pagination';
import { ConfirmDialog } from '~/components/ui/confirm-dialog';

function parseResponse(response: string): { type: 'landlord' | 'renter'; text: string; date?: string }[] {
  if (!response) return [];
  const messages: { type: 'landlord' | 'renter'; text: string; date?: string }[] = [];
  const parts = response.split(/\n*\[(Renter|Admin) \| ([^\]]+)\]:\n*/);
  if (parts.length > 0 && parts[0].trim()) {
    messages.push({ type: 'landlord', text: parts[0].trim() });
  }
  for (let i = 1; i < parts.length; i += 3) {
    const sender = parts[i];
    const date = parts[i + 1];
    const text = parts[i + 2] || '';
    if (text.trim()) {
      messages.push({ type: sender === 'Renter' ? 'renter' : 'landlord', text: text.trim(), date });
    }
  }
  return messages;
}

const API = (import.meta as any).env?.VITE_API_URL || '/api';

const statusConfig: Record<string, { dot: string; badge: string; label: string }> = {
  new: { dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.4)]', badge: 'bg-emerald-500/10 text-emerald-400', label: 'New' },
  responded: { dot: 'bg-blue-400 shadow-[0_0_6px_rgba(74,144,217,0.4)]', badge: 'bg-blue-500/10 text-blue-400', label: 'Responded' },
  read: { dot: 'bg-slate-500', badge: 'bg-muted text-muted-foreground', label: 'Read' },
};

export default function AdminInquiries() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [markReadLoading, setMarkReadLoading] = useState<string | null>(null);
  const [respondTarget, setRespondTarget] = useState<any>(null);
  const [respondText, setRespondText] = useState('');
  const [respondLoading, setRespondLoading] = useState(false);
  const [respondError, setRespondError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const params: any = { page, limit: 20, sortBy: 'newest' };
  if (statusFilter) params.status = statusFilter;
  if (refreshKey) params._t = refreshKey;

  const { data, isLoading, isError, error } = useInquiryList(params);
  const inquiries = data?.items ?? [];
  const meta = data?.meta;

  const handleMarkRead = async (id: string) => {
    setMarkReadLoading(id);
    try {
      const res = await fetch(`${API}/inquiries/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
        cache: 'no-cache',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Failed to mark as read (${res.status})`);
      }
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      setRespondError(e.message);
    } finally {
      setMarkReadLoading(null);
    }
  };

  const handleRespond = async () => {
    if (!respondTarget || !respondText.trim()) return;
    setRespondLoading(true);
    setRespondError('');
    try {
      const res = await fetch(`${API}/inquiries/${respondTarget.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: respondText.trim() }),
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Failed to respond (${res.status})`);
      }
      setRespondTarget(null);
      setRespondText('');
      setRespondError('');
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      setRespondError(e.message);
    } finally {
      setRespondLoading(false);
    }
  };

  const openRespond = (inq: any) => {
    setRespondTarget(inq);
    setRespondText('');
    setRespondError('');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API}/inquiries/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
        cache: 'no-cache',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Failed to delete (${res.status})`);
      }
      setDeleteTarget(null);
      setRefreshKey((k) => k + 1);
    } catch {
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: DataTableColumn<any>[] = [
    {
      key: 'renter',
      header: 'Renter',
      render: (inq) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{inq.name || 'Anonymous'}</p>
          <p className="text-xs text-muted-foreground truncate">{inq.email || '—'}</p>
        </div>
      ),
    },
    {
      key: 'property',
      header: 'Property',
      render: (inq) => (
        <span className="text-sm font-medium text-foreground truncate max-w-[200px] block">
          {inq.property?.title || `Property #${inq.propertyId?.slice(0, 8) || '—'}`}
        </span>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      render: (inq) => (
        <p className="text-sm text-muted-foreground truncate max-w-[280px]">{inq.message}</p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (inq) => {
        const cfg = statusConfig[inq.status] || statusConfig.new;
        return (
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.badge}`}>
              {cfg.label}
            </span>
          </span>
        );
      },
    },
    {
      key: 'date',
      header: 'Date',
      render: (inq) => (
        <span className="text-muted-foreground text-xs">
          {new Date(inq.createdAt).toLocaleDateString(undefined, {
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
      render: (inq) => (
        <div className="flex items-center justify-end gap-1">
          {inq.status === 'new' && (
            <button
              type="button"
              onClick={() => handleMarkRead(inq.id)}
              disabled={markReadLoading === inq.id}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors disabled:opacity-50"
            >
              {markReadLoading === inq.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              Read
            </button>
          )}
          <button
            type="button"
            onClick={() => openRespond(inq)}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {inq.status === 'responded' ? 'Reply' : 'Respond'}
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(inq)}
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
      <PageHeader title="Inquiries" description="View and respond to renter inquiries.">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="responded">Responded</option>
          <option value="read">Read</option>
        </select>
      </PageHeader>

      <DataTable
        columns={columns}
        data={inquiries}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as Error)?.message || 'Failed to load inquiries'}
        emptyMessage="No inquiries found."
      />

      {meta && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={setPage}
        />
      )}

      {respondTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => !respondLoading && setRespondTarget(null)}
          />
          <div className="relative z-10 w-full max-w-lg mx-4 rounded-xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Respond to Inquiry</h3>
              <button
                type="button"
                onClick={() => !respondLoading && setRespondTarget(null)}
                disabled={respondLoading}
                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">From</p>
                <p className="text-sm text-foreground font-medium">{respondTarget.name || 'Anonymous'}</p>
                <p className="text-xs text-muted-foreground">{respondTarget.email || '—'}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Property</p>
                <p className="text-sm text-foreground">{respondTarget.property?.title || '—'}</p>
              </div>

              {/* Conversation thread */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Conversation</p>
                <div className="space-y-3">
                  {/* Original inquiry message */}
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Renter</p>
                      <div className="bg-muted/40 rounded-lg px-3 py-2">
                        <p className="text-sm text-foreground">{respondTarget.message}</p>
                      </div>
                    </div>
                  </div>

                  {/* Previous responses */}
                  {parseResponse(respondTarget.response).map((msg, idx) => (
                    <div key={idx} className="flex gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.type === 'landlord' ? 'bg-purple-500/20' : 'bg-emerald-500/20'}`}>
                        <User className={`w-3.5 h-3.5 ${msg.type === 'landlord' ? 'text-purple-400' : 'text-emerald-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-muted-foreground mb-0.5">{msg.type === 'landlord' ? 'You' : 'Renter'}{msg.date ? ` · ${msg.date}` : ''}</p>
                        <div className={`rounded-lg px-3 py-2 ${msg.type === 'landlord' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                  {respondTarget.response ? 'Your Reply' : 'Your Response'}
                </label>
                <textarea
                  value={respondText}
                  onChange={(e) => setRespondText(e.target.value)}
                  placeholder={respondTarget.response ? "Type your reply..." : "Type your response..."}
                  rows={3}
                  autoFocus
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                />
              </div>

              {respondError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {respondError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <button
                type="button"
                onClick={() => setRespondTarget(null)}
                disabled={respondLoading}
                className="inline-flex items-center justify-center h-9 px-4 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRespond}
                disabled={respondLoading || !respondText.trim()}
                className="inline-flex items-center gap-1.5 justify-center h-9 px-4 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {respondLoading ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="h-3.5 w-3.5" /> {respondTarget?.response ? 'Send Reply' : 'Send Response'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Inquiry"
        message={`Are you sure you want to delete this inquiry from "${deleteTarget?.name || 'Anonymous'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
