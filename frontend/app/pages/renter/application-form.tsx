// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  Loader2,
  FileText,
  DollarSign,
  Briefcase,
  Calendar,
  PawPrint,
  MessageSquare,
  CheckCircle,
  ArrowLeft,
  Building2,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Home,
} from 'lucide-react';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

export default function ApplicationFormPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  useEffect(() => {
    if (!propertyId) return;
    fetch(`${API}/properties/${propertyId}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => setProperty(json?.data))
      .catch(() => {})
      .finally(() => setLoadingProperty(false));
  }, [propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !agreed) return;
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#080C14] flex items-center justify-center px-[24px]">
        <div className="max-w-[480px] w-full text-center">
          <div className="relative w-[96px] h-[96px] mx-auto mb-[32px]">
            <div className="absolute inset-0 rounded-full bg-[rgba(74,222,128,0.15)] animate-ping" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center shadow-[0_8px_32px_rgba(74,222,128,0.25)]">
              <CheckCircle className="w-[44px] h-[44px] text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-[28px] font-bold mb-[10px] text-[#F1F5F9]">Application Submitted!</h2>
          <p className="text-[15px] text-[#94A3B8] mb-[8px] leading-relaxed">
            Your application for <span className="font-semibold text-[#F1F5F9]">{property?.title || 'this property'}</span> has been sent to the landlord.
          </p>
          <p className="text-[13px] text-[#64748B] mb-[36px]">You will be notified when the status changes.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-[12px]">
            <button
              type="button"
              onClick={() => navigate('/applications')}
              className="h-[50px] px-[32px] rounded-[12px] bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white text-[14px] font-semibold hover:shadow-[0_8px_24px_rgba(74,144,217,0.3)] hover:-translate-y-[1px] transition-all cursor-pointer border-none flex items-center gap-[8px]"
            >
              <FileText className="w-[18px] h-[18px]" />
              View My Applications
            </button>
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="h-[50px] px-[32px] rounded-[12px] bg-white/[0.05] border border-white/[0.1] text-[#CBD5E1] text-[14px] font-semibold hover:bg-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer flex items-center gap-[8px]"
            >
              <Home className="w-[18px] h-[18px]" />
              Browse More
            </button>
          </div>
        </div>
      </div>
    );
  }

  const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) => (
    <div className="flex items-start gap-[12px] mb-[16px]">
      <div className="w-[36px] h-[36px] rounded-[10px] bg-gradient-to-br from-[#4A90D9]/20 to-[#7C3AED]/20 flex items-center justify-center shrink-0 mt-[2px]">
        <Icon className="w-[16px] h-[16px] text-[#4A90D9]" />
      </div>
      <div>
        <h3 className="text-[15px] font-bold text-[#F1F5F9]">{title}</h3>
        {subtitle && <p className="text-[12px] text-[#64748B] mt-[2px]">{subtitle}</p>}
      </div>
    </div>
  );

  const Input = ({
    label,
    type = 'text',
    icon: Icon,
    value,
    onChange,
    placeholder,
    field,
    children,
  }: {
    label: string;
    type?: string;
    icon?: any;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    field: string;
    children?: React.ReactNode;
  }) => (
    <div>
      <label className="flex items-center gap-[6px] text-[13px] font-semibold text-[#94A3B8] mb-[8px]">
        {Icon && <Icon className="w-[14px] h-[14px] text-[#4A90D9]" />}
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-[12px] border transition-all duration-200 ${
          focusedField === field
            ? 'border-[rgba(74,144,217,0.5)] shadow-[0_0_0_4px_rgba(74,144,217,0.08)]'
            : 'border-white/[0.08] hover:border-white/[0.15]'
        }`}
      >
        {children || (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            placeholder={placeholder}
            className="h-[50px] w-full rounded-[12px] px-[16px] text-[#F1F5F9] text-[14px] outline-none placeholder:text-[#475569] bg-white/[0.04]"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080C14]">
      {/* Top decorative bar */}
      <div className="h-[4px] bg-gradient-to-r from-[#4A90D9] via-[#7C3AED] to-[#4A90D9]" />

      <div className="max-w-[720px] mx-auto px-[20px] sm:px-[24px] py-[32px] sm:py-[48px]">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-[6px] text-[14px] text-[#64748B] hover:text-[#F1F5F9] transition-colors mb-[28px] cursor-pointer bg-transparent border-none font-medium"
        >
          <ArrowLeft className="w-[16px] h-[16px]" /> Back to property
        </button>

        {/* Header */}
        <div className="flex items-center gap-[14px] mb-[32px]">
          <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] flex items-center justify-center shadow-[0_4px_16px_rgba(74,144,217,0.25)]">
            <FileText className="w-[24px] h-[24px] text-white" />
          </div>
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#F1F5F9]">Rental Application</h1>
            <p className="text-[14px] text-[#64748B] mt-[2px]">Complete the form below to submit your application</p>
          </div>
        </div>

        {/* Property card */}
        {!loadingProperty && property && (
          <div className="mb-[28px] rounded-[14px] bg-white/[0.03] border border-white/[0.08] overflow-hidden">
            <div className="h-[100px] bg-gradient-to-r from-[#4A90D9]/10 to-[#7C3AED]/10 flex items-center px-[20px] gap-[14px]">
              <div className="w-[56px] h-[56px] rounded-[12px] bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] flex items-center justify-center text-white font-bold text-[18px] shrink-0">
                <Building2 className="w-[24px] h-[24px]" />
              </div>
              <div className="min-w-0">
                <p className="text-[16px] font-bold text-[#F1F5F9] truncate">{property.title}</p>
                <p className="text-[13px] text-[#64748B] truncate flex items-center gap-[4px]">
                  <MapPin className="w-[12px] h-[12px]" />
                  {property.address?.street || property.addressStreet}, {property.address?.city || property.addressCity}
                </p>
              </div>
              <div className="ml-auto text-right shrink-0">
                <p className="text-[18px] font-bold text-[#F1F5F9]">${property.price?.toLocaleString()}</p>
                <p className="text-[11px] text-[#64748B]">/month</p>
              </div>
            </div>
          </div>
        )}

        {/* Main form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#0B0F1A] rounded-[16px] border border-white/[0.08] overflow-hidden"
        >
          {/* Personal Info Section */}
          <div className="p-[24px] sm:p-[28px] border-b border-white/[0.06]">
            <SectionHeader
              icon={DollarSign}
              title="Financial Details"
              subtitle="Help the landlord understand your financial situation"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <Input
                label="Monthly Income"
                type="number"
                icon={DollarSign}
                value={formData.monthlyIncome}
                onChange={(v) => updateField('monthlyIncome', v)}
                placeholder="e.g. 5000"
                field="monthlyIncome"
              />
              <div>
                <label className="flex items-center gap-[6px] text-[13px] font-semibold text-[#94A3B8] mb-[8px]">
                  <Briefcase className="w-[14px] h-[14px] text-[#4A90D9]" />
                  Employment Status
                </label>
                <div
                  className={`relative rounded-[12px] border transition-all duration-200 ${
                    focusedField === 'employmentStatus'
                      ? 'border-[rgba(74,144,217,0.5)] shadow-[0_0_0_4px_rgba(74,144,217,0.08)]'
                      : 'border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => updateField('employmentStatus', e.target.value)}
                    onFocus={() => setFocusedField('employmentStatus')}
                    onBlur={() => setFocusedField(null)}
                    className="h-[50px] w-full rounded-[12px] px-[16px] text-[#F1F5F9] text-[14px] outline-none bg-white/[0.04] appearance-none cursor-pointer"
                  >
                    <option value="employed">Employed</option>
                    <option value="self_employed">Self-Employed</option>
                    <option value="student">Student</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="retired">Retired</option>
                  </select>
                  <ChevronRight className="absolute right-[14px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#64748B] rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Employer Section */}
          <div className="p-[24px] sm:p-[28px] border-b border-white/[0.06]">
            <SectionHeader
              icon={Briefcase}
              title="Employment Details"
              subtitle="Information about your current employer"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <Input
                label="Employer Name"
                icon={Building2}
                value={formData.employerName}
                onChange={(v) => updateField('employerName', v)}
                placeholder="Company or organization name"
                field="employerName"
              />
              <Input
                label="Employer Phone"
                type="tel"
                icon={Briefcase}
                value={formData.employerPhone}
                onChange={(v) => updateField('employerPhone', v)}
                placeholder="(555) 123-4567"
                field="employerPhone"
              />
            </div>
          </div>

          {/* Move-in & Pets Section */}
          <div className="p-[24px] sm:p-[28px] border-b border-white/[0.06]">
            <SectionHeader
              icon={Calendar}
              title="Move-in & Lifestyle"
              subtitle="When would you like to move in?"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] mb-[20px]">
              <Input
                label="Desired Move-in Date"
                type="date"
                icon={Calendar}
                value={formData.moveInDate}
                onChange={(v) => updateField('moveInDate', v)}
                field="moveInDate"
              />
            </div>

            <div>
              <label className="flex items-center gap-[6px] text-[13px] font-semibold text-[#94A3B8] mb-[12px]">
                <PawPrint className="w-[14px] h-[14px] text-[#4A90D9]" />
                Do you have pets?
              </label>
              <div className="inline-flex items-center gap-[4px] p-[4px] rounded-[10px] bg-white/[0.04] border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => updateField('hasPets', false)}
                  className={`h-[38px] px-[20px] rounded-[8px] text-[13px] font-semibold cursor-pointer border-none transition-all ${
                    !formData.hasPets
                      ? 'bg-white/[0.08] text-[#4A90D9] shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
                      : 'text-[#64748B] hover:text-[#94A3B8] bg-transparent'
                  }`}
                >
                  No pets
                </button>
                <button
                  type="button"
                  onClick={() => updateField('hasPets', true)}
                  className={`h-[38px] px-[20px] rounded-[8px] text-[13px] font-semibold cursor-pointer border-none transition-all ${
                    formData.hasPets
                      ? 'bg-white/[0.08] text-[#4A90D9] shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
                      : 'text-[#64748B] hover:text-[#94A3B8] bg-transparent'
                  }`}
                >
                  Yes, I have pets
                </button>
              </div>
            </div>

            {formData.hasPets && (
              <div className="mt-[16px] animate-[fadeIn_0.2s_ease-out]">
                <Input
                  label="Tell us about your pets"
                  icon={PawPrint}
                  value={formData.petDetails}
                  onChange={(v) => updateField('petDetails', v)}
                  placeholder="Breed, size, age, temperament..."
                  field="petDetails"
                />
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="p-[24px] sm:p-[28px] border-b border-white/[0.06]">
            <SectionHeader
              icon={MessageSquare}
              title="Additional Information"
              subtitle="Anything else the landlord should know?"
            />
            <div>
              <label className="flex items-center gap-[6px] text-[13px] font-semibold text-[#94A3B8] mb-[8px]">
                <MessageSquare className="w-[14px] h-[14px] text-[#4A90D9]" />
                Notes for the Landlord
              </label>
              <div
                className={`rounded-[12px] border transition-all duration-200 ${
                  focusedField === 'notes'
                    ? 'border-[rgba(74,144,217,0.5)] shadow-[0_0_0_4px_rgba(74,144,217,0.08)]'
                    : 'border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => updateField('additionalNotes', e.target.value)}
                  onFocus={() => setFocusedField('notes')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Why are you interested in this property? Any special requirements?"
                  rows={4}
                  className="w-full rounded-[12px] px-[16px] py-[14px] text-[#F1F5F9] text-[14px] outline-none placeholder:text-[#475569] bg-white/[0.04] resize-y min-h-[120px] leading-[1.6]"
                />
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="p-[24px] sm:p-[28px] bg-[rgba(74,144,217,0.03)]">
            {/* Agreement checkbox */}
            <label className="flex items-start gap-[12px] mb-[20px] cursor-pointer group">
              <div
                className={`w-[22px] h-[22px] rounded-[6px] border-2 flex items-center justify-center shrink-0 mt-[2px] transition-all ${
                  agreed
                    ? 'bg-[#4A90D9] border-[#4A90D9]'
                    : 'border-white/[0.2] group-hover:border-[rgba(74,144,217,0.5)] bg-transparent'
                }`}
              >
                {agreed && <CheckCircle className="w-[14px] h-[14px] text-white" />}
              </div>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <p className="text-[13px] text-[#94A3B8] leading-[1.6]">
                I confirm that all information provided is accurate and I consent to sharing this application with the property owner for review.
              </p>
            </label>

            <button
              type="submit"
              disabled={isSubmitting || !agreed}
              className="w-full h-[54px] rounded-[12px] bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white text-[15px] font-semibold hover:shadow-[0_8px_32px_rgba(74,144,217,0.3)] hover:-translate-y-[1px] active:translate-y-0 transition-all cursor-pointer disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-[10px] border-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-[20px] h-[20px] animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <Sparkles className="w-[18px] h-[18px]" />
                  Submit Application
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-[6px] mt-[16px]">
              <ShieldCheck className="w-[14px] h-[14px] text-[#64748B]" />
              <p className="text-[12px] text-[#64748B]">Your information is securely transmitted and encrypted</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
