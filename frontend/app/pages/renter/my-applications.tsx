// @ts-nocheck
import { Link } from 'react-router-dom';
import { FileText, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  submitted: { label: 'Submitted', color: 'bg-[rgba(74,144,217,0.1)] text-[#4A90D9]', icon: <Clock className="w-[14px] h-[14px]" /> },
  under_review: { label: 'Under Review', color: 'bg-[rgba(251,191,36,0.1)] text-[#FBBF24]', icon: <Clock className="w-[14px] h-[14px]" /> },
  approved: { label: 'Approved', color: 'bg-[rgba(74,222,128,0.1)] text-[#4ADE80]', icon: <CheckCircle className="w-[14px] h-[14px]" /> },
  rejected: { label: 'Rejected', color: 'bg-[rgba(248,113,113,0.1)] text-[#F87171]', icon: <XCircle className="w-[14px] h-[14px]" /> },
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/applications/my`, { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => setApplications(json?.data || []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px]">
        <Loader2 className="w-[32px] h-[32px] animate-spin mb-[16px] text-[#4A90D9]" />
        <p className="text-[15px] text-[#64748B]">Loading applications...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px]">
        <FileText className="w-[48px] h-[48px] text-[#64748B] mb-[16px]" />
        <p className="text-[18px] font-semibold text-[#F1F5F9]">No applications yet</p>
        <p className="text-[14px] text-[#64748B] mt-[4px] mb-[20px]">Apply for properties to see them here</p>
        <Link
          to="/search"
          className="inline-flex items-center justify-center font-semibold cursor-pointer border-none bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white h-[48px] px-[28px] rounded-[12px] text-[14px] hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] transition-all no-underline"
        >
          Browse Properties
        </Link>
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
          <h1 className="text-[28px] font-bold tracking-[-0.02em]">My Applications</h1>
          <p className="text-[14px] text-[#64748B]">Track your rental applications</p>
        </div>
      </div>

      <div className="space-y-[12px]">
        {applications.map((app) => {
          const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.submitted;
          return (
            <div
              key={app.id}
              className="bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[12px] p-[20px] flex flex-col sm:flex-row sm:items-center gap-[16px]"
            >
              <div className="flex-1">
                <div className="flex items-center gap-[10px] mb-[6px]">
                  <Link to={`/property/${app.property?.id}`} className="text-[16px] font-semibold text-[#F1F5F9] hover:text-[#4A90D9] transition-colors no-underline">
                    {app.property?.title || 'Property'}
                  </Link>
                  <span className={`inline-flex items-center gap-[4px] px-[10px] py-[2px] rounded-full text-[11px] font-semibold ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </span>
                </div>
                <p className="text-[14px] text-[#94A3B8]">
                  Submitted on {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
