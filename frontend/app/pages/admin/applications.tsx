// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

const STATUS_OPTIONS = ['submitted', 'under_review', 'approved', 'rejected'];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center gap-[10px] mb-[32px]">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-[rgba(74,144,217,0.1)] flex items-center justify-center">
          <FileText className="w-[20px] h-[20px] text-[#4A90D9]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.02em]">Applications</h1>
          <p className="text-[14px] text-[#64748B]">Review and manage rental applications</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-[60px]">
          <FileText className="w-[32px] h-[32px] text-[#64748B] mx-auto mb-[8px]" />
          <p className="text-[14px] text-[#94A3B8]">No applications yet</p>
        </div>
      ) : (
        <div className="space-y-[12px]">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[12px] p-[20px]"
            >
              <div className="flex items-center justify-between mb-[12px]">
                <div className="flex items-center gap-[10px]">
                  <Link to={`/property/${app.property?.id}`} className="text-[16px] font-semibold text-[#F1F5F9] hover:text-[#4A90D9] transition-colors no-underline">
                    {app.property?.title || 'Property'}
                  </Link>
                  <span className={`px-[10px] py-[2px] rounded-full text-[11px] font-semibold capitalize ${
                    app.status === 'approved'
                      ? 'bg-[rgba(74,222,128,0.1)] text-[#4ADE80]'
                      : app.status === 'rejected'
                      ? 'bg-[rgba(248,113,113,0.1)] text-[#F87171]'
                      : 'bg-[rgba(251,191,36,0.1)] text-[#FBBF24]'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
                <select
                  value={app.status}
                  onChange={(e) => updateStatus(app.id, e.target.value)}
                  className="h-[32px] bg-white/5 border border-white/10 rounded-[8px] px-[10px] text-[13px] text-[#F1F5F9] outline-none focus:border-[rgba(74,144,217,0.5)] cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-[12px] text-[13px] text-[#94A3B8]">
                <div>
                  <p className="text-[11px] text-[#64748B] uppercase tracking-wider">Applicant</p>
                  <p className="text-[#F1F5F9] font-medium">{app.applicant?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B] uppercase tracking-wider">Income</p>
                  <p className="text-[#F1F5F9] font-medium">${app.monthlyIncome?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B] uppercase tracking-wider">Employment</p>
                  <p className="text-[#F1F5F9] font-medium capitalize">{app.employmentStatus || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B] uppercase tracking-wider">Move-in</p>
                  <p className="text-[#F1F5F9] font-medium">{app.moveInDate ? new Date(app.moveInDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
