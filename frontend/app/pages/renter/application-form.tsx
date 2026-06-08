// @ts-nocheck
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Loader2, FileText, DollarSign, Briefcase, Calendar, PawPrint, MessageSquare } from 'lucide-react';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

export default function ApplicationFormPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    employmentStatus: 'employed',
    employerName: '',
    employerPhone: '',
    moveInDate: '',
    hasPets: false,
    petDetails: '',
    additionalNotes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return;
    setIsSubmitting(true);
    try {
      await fetch(`${API}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : undefined,
          employmentStatus: formData.employmentStatus,
          employerName: formData.employerName || undefined,
          employerPhone: formData.employerPhone || undefined,
          moveInDate: formData.moveInDate || undefined,
          hasPets: formData.hasPets,
          petDetails: formData.petDetails || undefined,
          additionalNotes: formData.additionalNotes || undefined,
        }),
        credentials: 'include',
      });
      setSubmitted(true);
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-[640px] mx-auto px-[24px] py-[80px] text-center">
        <div className="w-[64px] h-[64px] rounded-full bg-[rgba(74,222,128,0.1)] flex items-center justify-center mx-auto mb-[20px]">
          <Send className="w-[28px] h-[28px] text-[#4ADE80]" />
        </div>
        <h2 className="text-[24px] font-bold mb-[8px]">Application Submitted!</h2>
        <p className="text-[14px] text-[#94A3B8] mb-[24px]">The landlord will review your application and get back to you soon.</p>
        <button
          type="button"
          onClick={() => navigate('/applications')}
          className="h-[48px] px-[28px] rounded-[12px] bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white text-[14px] font-semibold hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] transition-all cursor-pointer border-none"
        >
          View My Applications
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto px-[24px] py-[40px]">
      <div className="flex items-center gap-[10px] mb-[32px]">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-[rgba(74,144,217,0.1)] flex items-center justify-center">
          <FileText className="w-[20px] h-[20px] text-[#4A90D9]" />
        </div>
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.02em]">Rental Application</h1>
          <p className="text-[14px] text-[#64748B]">Apply for this property</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-[20px]">
        <div>
          <label className="flex items-center gap-[6px] text-[13px] font-medium text-[#94A3B8] mb-[6px]">
            <DollarSign className="w-[14px] h-[14px]" />
            Monthly Income
          </label>
          <input
            type="number"
            value={formData.monthlyIncome}
            onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
            placeholder="5000"
            className="h-[48px] w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[16px] text-[#F1F5F9] text-[14px] outline-none placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)]"
          />
        </div>

        <div>
          <label className="flex items-center gap-[6px] text-[13px] font-medium text-[#94A3B8] mb-[6px]">
            <Briefcase className="w-[14px] h-[14px]" />
            Employment Status
          </label>
          <select
            value={formData.employmentStatus}
            onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
            className="h-[48px] w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[16px] text-[#F1F5F9] text-[14px] outline-none focus:border-[rgba(74,144,217,0.5)] appearance-none"
          >
            <option value="employed">Employed</option>
            <option value="self_employed">Self-Employed</option>
            <option value="student">Student</option>
            <option value="unemployed">Unemployed</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        <div>
          <label className="text-[13px] font-medium text-[#94A3B8] mb-[6px] block">Employer Name</label>
          <input
            type="text"
            value={formData.employerName}
            onChange={(e) => setFormData({ ...formData, employerName: e.target.value })}
            placeholder="Company name"
            className="h-[48px] w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[16px] text-[#F1F5F9] text-[14px] outline-none placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)]"
          />
        </div>

        <div>
          <label className="flex items-center gap-[6px] text-[13px] font-medium text-[#94A3B8] mb-[6px]">
            <Calendar className="w-[14px] h-[14px]" />
            Desired Move-in Date
          </label>
          <input
            type="date"
            value={formData.moveInDate}
            onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
            className="h-[48px] w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[16px] text-[#F1F5F9] text-[14px] outline-none focus:border-[rgba(74,144,217,0.5)]"
          />
        </div>

        <div>
          <label className="flex items-center gap-[6px] text-[13px] font-medium text-[#94A3B8] mb-[6px]">
            <PawPrint className="w-[14px] h-[14px]" />
            Do you have pets?
          </label>
          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, hasPets: true })}
              className={`h-[40px] px-[16px] rounded-[10px] text-[13px] font-medium cursor-pointer border-none transition-colors ${
                formData.hasPets ? 'bg-[rgba(74,144,217,0.2)] text-[#4A90D9]' : 'bg-white/5 text-[#94A3B8] hover:bg-white/10'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, hasPets: false })}
              className={`h-[40px] px-[16px] rounded-[10px] text-[13px] font-medium cursor-pointer border-none transition-colors ${
                !formData.hasPets ? 'bg-[rgba(74,144,217,0.2)] text-[#4A90D9]' : 'bg-white/5 text-[#94A3B8] hover:bg-white/10'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {formData.hasPets && (
          <div>
            <label className="text-[13px] font-medium text-[#94A3B8] mb-[6px] block">Pet Details</label>
            <input
              type="text"
              value={formData.petDetails}
              onChange={(e) => setFormData({ ...formData, petDetails: e.target.value })}
              placeholder="Dog, Cat, etc."
              className="h-[48px] w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[16px] text-[#F1F5F9] text-[14px] outline-none placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)]"
            />
          </div>
        )}

        <div>
          <label className="flex items-center gap-[6px] text-[13px] font-medium text-[#94A3B8] mb-[6px]">
            <MessageSquare className="w-[14px] h-[14px]" />
            Additional Notes
          </label>
          <textarea
            value={formData.additionalNotes}
            onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
            placeholder="Anything else you'd like the landlord to know..."
            rows={4}
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[16px] py-[12px] text-[#F1F5F9] text-[14px] outline-none placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)] resize-y min-h-[100px]"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-[52px] rounded-[12px] bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white text-[15px] font-semibold hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-[8px] border-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-[18px] h-[18px] animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-[18px] h-[18px]" />
              Submit Application
            </>
          )}
        </button>
      </form>
    </div>
  );
}
