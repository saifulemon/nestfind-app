// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Loader2, CheckCircle, XCircle, Clock, Search, MapPin, DollarSign, Briefcase, Calendar, PawPrint, MessageSquare, Filter } from 'lucide-react';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

const STATUS_OPTIONS = ['submitted', 'under_review', 'approved', 'rejected'];

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  submitted: { bg: 'bg-[rgba(59,130,246,0.08)]', text: 'text-[#3B82F6]', icon: <Clock className="w-[12px] h-[12px]" />, label: 'Submitted' },
  under_review: { bg: 'bg-[rgba(251,191,36,0.08)]', text: 'text-[#D97706]', icon: <Clock className="w-[12px] h-[12px]" />, label: 'Under Review' },
  approved: { bg: 'bg-[rgba(34,197,94,0.08)]', text: 'text-[#16A34A]', icon: <CheckCircle className="w-[12px] h-[12px]" />, label: 'Approved' },
  rejected: { bg: 'bg-[rgba(239,68,68,0.08)]', text: 'text-[#DC2626]', icon: <XCircle className="w-[12px] h-[12px]" />, label: 'Rejected' },
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/applications`, { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => setApplications(json?.data || []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`${API}/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
    } catch {
      // ignore
    }
  };

  const filtered = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (app.applicant?.name || '').toLowerCase().includes(q) ||
      (app.property?.title || '').toLowerCase().includes(q);
    const matchesStatus = !statusFilter || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = applications.filter((a) => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px]">
        <Loader2 className="w-[32px] h-[32px] animate-spin mb-[16px] text-[#4A90D9]" />
        <p className="text-[15px] text-[#64748B]">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-[24px] sm:px-[48px] py-[40px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[16px] mb-[32px]">
        <div className="flex items-center gap-[12px]">
          <div className="w-[44px] h-[44px] rounded-[10px] bg-[rgba(74,144,217,0.08)] flex items-center justify-center">
            <FileText className="w-[22px] h-[22px] text-[#4A90D9]" />
          </div>
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#1E293B]">Applications</h1>
            <p className="text-[14px] text-[#64748B]">Review and manage rental applications</p>
          </div>
        </div>
        <Link
          to="/admin/dashboard"
          className="text-[13px] text-[#4A90D9] hover:text-[#5BA0E9] no-underline font-medium"
        >
          Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-[12px] mb-[24px]">
        <div className="relative flex-1">
          <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by applicant or property..."
            className="w-full h-[42px] bg-white border border-gray-200 rounded-[10px] pl-[40px] pr-[16px] text-[14px] text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#4A90D9] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.08)] transition-all"
          />
        </div>
        <div className="flex items-center gap-[8px] overflow-x-auto pb-[4px]">
          <button
            type="button"
            onClick={() => setStatusFilter(null)}
            className={`h-[42px] px-[14px] rounded-[10px] text-[13px] font-medium border transition-all shrink-0 ${
              !statusFilter
                ? 'bg-[#1E293B] text-white border-[#1E293B]'
                : 'bg-white text-[#64748B] border-gray-200 hover:border-gray-300'
            }`}
          >
            All ({applications.length})
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(statusFilter === s ? null : s)}
              className={`h-[42px] px-[14px] rounded-[10px] text-[13px] font-medium border transition-all shrink-0 flex items-center gap-[6px] ${
                statusFilter === s
                  ? `${STATUS_STYLES[s].bg} ${STATUS_STYLES[s].text} border-current`
                  : 'bg-white text-[#64748B] border-gray-200 hover:border-gray-300'
              }`}
            >
              {STATUS_STYLES[s].icon}
              {STATUS_STYLES[s].label} ({counts[s] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[80px] text-center">
          <div className="w-[64px] h-[64px] rounded-full bg-[#F1F5F9] flex items-center justify-center mb-[16px]">
            <FileText className="w-[28px] h-[28px] text-[#CBD5E1]" />
          </div>
          <p className="text-[15px] text-[#64748B] font-medium">No applications yet</p>
          <p className="text-[13px] text-[#94A3B8] mt-[4px]">Applications will appear here when renters submit them</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[80px] text-center">
          <Search className="w-[32px] h-[32px] text-[#CBD5E1] mb-[8px]" />
          <p className="text-[15px] text-[#64748B]">No matching applications</p>
        </div>
      ) : (
        <div className="space-y-[12px]">
          {filtered.map((app) => {
            const status = STATUS_STYLES[app.status] || STATUS_STYLES.submitted;
            const initial = (app.applicant?.name?.charAt(0) || 'U').toUpperCase();

            return (
              <div
                key={app.id}
                className="bg-white border border-gray-100 rounded-[12px] p-[20px] sm:p-[24px] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow"
              >
                {/* Top row: applicant + status + action */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-[12px] mb-[16px]">
                  <div className="flex items-start gap-[12px]">
                    <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                      {initial}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#1E293B]">
                        {app.applicant?.name || 'Unknown Applicant'}
                      </p>
                      <div className="flex items-center gap-[8px] mt-[2px]">
                        <Link
                          to={`/property/${app.property?.id}`}
                          className="text-[13px] text-[#4A90D9] hover:underline no-underline"
                        >
                          {app.property?.title || 'Property'}
                        </Link>
                        <span className="text-gray-300">·</span>
                        <span className="text-[12px] text-[#94A3B8]">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-[10px] shrink-0">
                    <span className={`inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-full text-[12px] font-semibold ${status.bg} ${status.text}`}>
                      {status.icon}
                      {status.label}
                    </span>
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className="h-[34px] bg-white border border-gray-200 rounded-[8px] px-[10px] text-[13px] text-[#1E293B] outline-none focus:border-[#4A90D9] cursor-pointer hover:border-gray-300 transition-colors"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-[12px] bg-[#F8FAFC] rounded-[10px] p-[14px]">
                  <div className="flex items-start gap-[8px]">
                    <DollarSign className="w-[14px] h-[14px] text-[#94A3B8] mt-[2px] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-medium">Monthly Income</p>
                      <p className="text-[13px] text-[#1E293B] font-semibold">${app.monthlyIncome?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-[8px]">
                    <Briefcase className="w-[14px] h-[14px] text-[#94A3B8] mt-[2px] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-medium">Employment</p>
                      <p className="text-[13px] text-[#1E293B] font-semibold capitalize">{app.employmentStatus?.replace('_', ' ') || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-[8px]">
                    <Calendar className="w-[14px] h-[14px] text-[#94A3B8] mt-[2px] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-medium">Move-in Date</p>
                      <p className="text-[13px] text-[#1E293B] font-semibold">{app.moveInDate ? new Date(app.moveInDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-[8px]">
                    <PawPrint className="w-[14px] h-[14px] text-[#94A3B8] mt-[2px] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-medium">Pets</p>
                      <p className="text-[13px] text-[#1E293B] font-semibold">{app.hasPets ? (app.petDetails || 'Yes') : 'No'}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {app.additionalNotes && (
                  <div className="mt-[12px] flex items-start gap-[8px]">
                    <MessageSquare className="w-[14px] h-[14px] text-[#94A3B8] mt-[2px] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-medium mb-[2px]">Additional Notes</p>
                      <p className="text-[13px] text-[#475569]">{app.additionalNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
