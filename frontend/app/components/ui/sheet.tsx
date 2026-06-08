import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  side?: 'left' | 'right';
}

export function Sheet({ open, onClose, children, title, side = 'right' }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sideClasses = side === 'right'
    ? 'right-0 translate-x-full data-[state=open]:translate-x-0'
    : 'left-0 -translate-x-full data-[state=open]:translate-x-0';

  return (
    <div className="fixed inset-0 z-50" data-state={open ? 'open' : 'closed'}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={`absolute top-0 h-full w-[85vw] max-w-[320px] bg-[#0B0F1A] border-l border-white/[0.08] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${sideClasses}`}
        data-state="open"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          {title && <h2 className="text-[16px] font-semibold text-[#F1F5F9]">{title}</h2>}
          {!title && <div />}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

interface SheetTriggerProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export function SheetTrigger({ children, onClick, className }: SheetTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label="Open navigation menu"
    >
      {children}
    </button>
  );
}

interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetContent({ children, className }: SheetContentProps) {
  return <div className={className}>{children}</div>;
}
