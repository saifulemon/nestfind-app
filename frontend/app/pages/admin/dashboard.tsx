// @ts-nocheck
import { Link } from 'react-router-dom';
import { useDashboardStats } from '~/hooks/api/useAdmin';
import { Building2, MessageSquare, Users, TrendingUp, ArrowUpRight, Clock } from 'lucide-react';

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-4 w-72 bg-muted rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 bg-muted rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-36 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 bg-muted rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-36 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const statCards = [
  { key: 'totalProperties', label: 'Total Properties', icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10', to: '/admin/properties' },
  { key: 'totalInquiries', label: 'Total Inquiries', icon: MessageSquare, color: 'text-violet-400', bg: 'bg-violet-500/10', to: '/admin/inquiries' },
  { key: 'newInquiries', label: 'New Inquiries', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', to: '/admin/inquiries?status=new' },
  { key: 'totalUsers', label: 'Registered Users', icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10', to: '/admin/users' },
];

export default function AdminDashboard() {
  const { data, isLoading, isError, error } = useDashboardStats();
  const stats = data;

  if (isLoading) return <Skeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <span className="text-destructive text-xl">!</span>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Failed to load dashboard</h2>
        <p className="text-sm text-muted-foreground">{(error as Error)?.message || 'An unexpected error occurred'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your platform activity and metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const value = stats?.[card.key] ?? 0;
          return (
            <Link
              key={card.key}
              to={card.to}
              className="group rounded-xl border border-border bg-card hover:border-border/80 hover:shadow-sm transition-all p-5 block no-underline"
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-lg ${card.bg} p-2`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
              </div>
              <p className="mt-4 text-3xl font-bold text-foreground tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Recent Properties</h2>
          </div>
          {stats?.recentProperties?.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.recentProperties.map((prop: any) => (
                <div key={prop.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{prop.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{prop.propertyType}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-foreground tabular-nums">${prop.price?.toLocaleString()}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(prop.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No properties yet.</div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Recent Inquiries</h2>
          </div>
          {stats?.recentInquiries?.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.recentInquiries.map((inq: any) => (
                <div key={inq.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{inq.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {inq.email}{inq.propertyTitle ? ` — ${inq.propertyTitle}` : ''}
                    </p>
                  </div>
                  <span className={`ml-4 shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    inq.status === 'new' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'
                  }`}>
                    {inq.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No inquiries yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
