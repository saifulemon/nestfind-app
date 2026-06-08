// @ts-nocheck
import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '~/hooks/useAuth';
import { useProfile, useUpdateProfile, useUpdateAvatar } from '~/hooks/api/useProfile';
import { User, Shield, LogOut, Loader2, X, Check, Camera, Home, AlertTriangle } from 'lucide-react';
import { useLogout } from '~/hooks/api/useAuth';

function getAvatarUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith('/') ? url : '/' + url;
}

export default function ProfilePage() {
  const { data: profile, isLoading, isError, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();
  const { user } = useAuth();
  const { logout } = useLogout();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'security'>('personal');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1 py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#4A90D9]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20">
        <div className="w-14 h-14 rounded-full bg-[rgba(248,113,113,0.1)] flex items-center justify-center mb-4">
          <X className="w-6 h-6 text-[#F87171]" />
        </div>
        <p className="text-lg font-semibold">Failed to load profile</p>
        <p className="text-sm text-[#64748B] mt-1">{(error as Error)?.message || 'Please try again'}</p>
      </div>
    );
  }

  const userData = profile?.data || profile || user || {};
  const displayName = userData.name || userData.email?.split('@')[0] || 'User';
  const email = userData.email || '';
  const role = userData.role || 'renter';

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMsg(null);
    const form = new FormData(e.currentTarget);
    updateProfile.mutate(
      {
        name: (form.get('name') as string) || undefined,
        phone: (form.get('phone') as string) || undefined,
      },
      { onSuccess: () => { setSuccessMsg('Profile updated successfully'); setTimeout(() => setSuccessMsg(null), 3000); } }
    );
  };

  const currentAvatar = avatarUrl || getAvatarUrl(userData.avatarUrl) || getAvatarUrl((profile as any)?.data?.avatarUrl) || getAvatarUrl((profile as any)?.avatarUrl);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarSuccess(null);
    setSuccessMsg(null);
    try {
      const data = await updateAvatar.mutate(file, {
        onSuccess: (result: any) => {
          const newUrl = result?.data?.avatarUrl || result?.avatarUrl;
          if (newUrl) {
            setAvatarUrl(getAvatarUrl(newUrl));
          }
        },
      });
      const newUrl = data?.data?.avatarUrl || data?.avatarUrl;
      if (newUrl) {
        setAvatarUrl(getAvatarUrl(newUrl));
      }
      setAvatarSuccess('Avatar updated successfully');
      setTimeout(() => setAvatarSuccess(null), 3000);
    } catch {
      // error is handled by hook state
    }
    // reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleSwitchToOwner = async () => {
    setShowOwnerModal(false);
    await logout();
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex-1 w-full">
      <div className="max-w-[1200px] mx-auto px-[24px] sm:px-[48px] py-[40px]">
        <div className="flex flex-col md:flex-row gap-[24px]">

          {/* Left Sidebar */}
          <aside className="w-full md:w-[260px] shrink-0">
            <div className="bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[16px] overflow-hidden">
              {/* Profile Card */}
              <div className="p-[24px] border-b border-white/[0.06] text-center">
                <div className="relative w-[80px] h-[80px] mx-auto mb-[12px]">
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={updateAvatar.isPending}
                    className="w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-white/10 bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] flex items-center justify-center cursor-pointer disabled:opacity-60 transition-all hover:shadow-[0_0_20px_rgba(74,144,217,0.3)]"
                  >
                    {currentAvatar ? (
                      <img
                        src={currentAvatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[28px] font-bold text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>
                  <div
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 w-[28px] h-[28px] rounded-full bg-[#4A90D9] border-2 border-[#0B0F1A] flex items-center justify-center cursor-pointer hover:bg-[#3A7BC8] transition-colors"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAvatarClick(); }}
                  >
                    {updateAvatar.isPending ? (
                      <Loader2 className="w-[14px] h-[14px] text-white animate-spin" />
                    ) : (
                      <Camera className="w-[14px] h-[14px] text-white" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                {avatarSuccess && (
                  <p className="text-[12px] text-[#4ADE80] mb-[8px]">{avatarSuccess}</p>
                )}
                {updateAvatar.isError && (
                  <p className="text-[12px] text-[#F87171] mb-[8px]">{(updateAvatar.error as Error)?.message || 'Avatar upload failed'}</p>
                )}
                <h3 className="text-[16px] font-semibold">{displayName}</h3>
                <p className="text-[13px] text-[#64748B] mt-[2px]">{email}</p>
                <span className="inline-block mt-[8px] px-[10px] py-[3px] rounded-full text-[11px] font-medium bg-[rgba(74,144,217,0.12)] text-[#4A90D9] capitalize">
                  {role}
                </span>
              </div>

              {/* Navigation */}
              <nav className="p-[12px] space-y-[4px]">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`w-full flex items-center gap-[10px] px-[12px] py-[10px] text-[13px] font-medium rounded-[10px] transition-colors ${
                    activeTab === 'personal'
                      ? 'bg-[rgba(74,144,217,0.15)] text-[#4A90D9]'
                      : 'text-[#94A3B8] hover:bg-white/5 hover:text-[#F1F5F9]'
                  }`}
                >
                  <User className="w-[16px] h-[16px]" />
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-[10px] px-[12px] py-[10px] text-[13px] font-medium rounded-[10px] transition-colors ${
                    activeTab === 'security'
                      ? 'bg-[rgba(74,144,217,0.15)] text-[#4A90D9]'
                      : 'text-[#94A3B8] hover:bg-white/5 hover:text-[#F1F5F9]'
                  }`}
                >
                  <Shield className="w-[16px] h-[16px]" />
                  Security
                </button>
                <div className="pt-[8px] mt-[8px] border-t border-white/[0.06]">
                  <button
                    onClick={() => setShowOwnerModal(true)}
                    className="w-full flex items-center gap-[10px] px-[12px] py-[10px] text-[13px] font-medium rounded-[10px] text-[#94A3B8] hover:bg-white/5 hover:text-[#F1F5F9] transition-colors cursor-pointer bg-transparent border-none"
                  >
                    <Home className="w-[16px] h-[16px]" />
                    For Owners
                  </button>
                </div>
                <div className="pt-[8px] mt-[8px] border-t border-white/[0.06]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-[10px] px-[12px] py-[10px] text-[13px] font-medium rounded-[10px] text-[#F87171] hover:bg-[rgba(248,113,113,0.08)] transition-colors"
                  >
                    <LogOut className="w-[16px] h-[16px]" />
                    Log Out
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[16px] p-[24px] sm:p-[32px]">

            {activeTab === 'personal' && (
              <>
                <h2 className="text-[20px] font-semibold tracking-[-0.02em] mb-[24px]">Personal Information</h2>

                {successMsg && (
                  <div className="mb-[20px] p-[14px] rounded-[10px] bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.2)] text-[#4ADE80] text-[13px] flex items-center gap-[8px]">
                    <Check className="w-[16px] h-[16px]" />
                    {successMsg}
                  </div>
                )}

                {updateProfile.isError && (
                  <div className="mb-[20px] p-[14px] rounded-[10px] bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.2)] text-[#F87171] text-[13px]">
                    {(updateProfile.error as Error)?.message || 'Update failed'}
                  </div>
                )}

                {/* Read-only fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] mb-[24px]">
                  <div className="bg-white/5 border border-white/[0.06] rounded-[10px] p-[16px]">
                    <p className="text-[12px] text-[#64748B] uppercase tracking-[0.04em] mb-[4px]">Email</p>
                    <p className="text-[15px] font-medium text-[#94A3B8]">{email}</p>
                  </div>
                  <div className="bg-white/5 border border-white/[0.06] rounded-[10px] p-[16px]">
                    <p className="text-[12px] text-[#64748B] uppercase tracking-[0.04em] mb-[4px]">Role</p>
                    <p className="text-[15px] font-medium text-[#94A3B8] capitalize">{role}</p>
                  </div>
                </div>

                {/* Editable form */}
                <form onSubmit={handleSubmit} className="space-y-[16px]">
                  <div>
                    <label className="block text-[13px] font-medium text-[#94A3B8] mb-[6px]">Name</label>
                    <input
                      name="name"
                      defaultValue={userData.name || ''}
                      minLength={2}
                      maxLength={100}
                      placeholder="Enter your name"
                      className="h-[48px] w-full bg-white/5 border border-white/10 rounded-[10px] px-[16px] text-[#F1F5F9] text-[14px] outline-none placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#94A3B8] mb-[6px]">Phone</label>
                    <input
                      name="phone"
                      defaultValue={userData.phone || ''}
                      maxLength={20}
                      placeholder="Enter your phone number"
                      className="h-[48px] w-full bg-white/5 border border-white/10 rounded-[10px] px-[16px] text-[#F1F5F9] text-[14px] outline-none placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)] transition-all"
                    />
                  </div>
                  <div className="pt-[8px]">
                    <button
                      type="submit"
                      disabled={updateProfile.isPending}
                      className="inline-flex items-center justify-center font-semibold cursor-pointer border-none bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white h-[48px] px-[28px] rounded-[12px] text-[14px] hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updateProfile.isPending ? 'Saving...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <h2 className="text-[20px] font-semibold tracking-[-0.02em] mb-[24px]">Security</h2>
                <p className="text-[14px] text-[#94A3B8] mb-[24px]">Manage your password and account security settings.</p>
                <div className="bg-white/5 border border-white/[0.06] rounded-[10px] p-[20px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[15px] font-medium">Password</p>
                      <p className="text-[13px] text-[#64748B] mt-[2px]">Change your account password</p>
                    </div>
                    <a
                      href="/forgot-password"
                      className="inline-flex items-center justify-center font-medium cursor-pointer border border-white/10 bg-white/5 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/10 h-[40px] px-[20px] rounded-[10px] text-[13px] transition-colors no-underline"
                    >
                      Change Password
                    </a>
                  </div>
                </div>
              </>
            )}

          </main>
        </div>
      </div>

      {/* Switch to Owner Modal */}
      {showOwnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowOwnerModal(false)}>
          <div className="bg-[#0B0F1A] border border-white/[0.08] rounded-[16px] max-w-[400px] w-full mx-[24px] p-[28px] shadow-[0_0_40px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-[12px] mb-[16px]">
              <div className="w-[40px] h-[40px] rounded-full bg-[rgba(251,191,36,0.12)] flex items-center justify-center">
                <AlertTriangle className="w-[20px] h-[20px] text-[#FBBF24]" />
              </div>
              <h3 className="text-[18px] font-semibold">Switch to Owner Mode?</h3>
            </div>
            <p className="text-[14px] text-[#94A3B8] leading-relaxed mb-[24px]">
              You are currently logged in as a <strong className="text-[#F1F5F9]">renter</strong>. To access the owner dashboard, you need to log out of your current account and sign in with an owner account.
            </p>
            <div className="flex gap-[12px]">
              <button
                onClick={() => setShowOwnerModal(false)}
                className="flex-1 h-[44px] rounded-[10px] bg-white/5 border border-white/10 text-[#94A3B8] text-[14px] font-medium hover:bg-white/10 hover:text-[#F1F5F9] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSwitchToOwner}
                className="flex-1 h-[44px] rounded-[10px] bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white text-[14px] font-medium hover:shadow-[0_0_20px_rgba(74,144,217,0.3)] transition-all cursor-pointer border-none"
              >
                Log Out &amp; Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
