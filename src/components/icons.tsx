'use client';

// ============================================
// Custom Icons — Premium SaaS Design
// ============================================

interface IconProps {
    className?: string;
    size?: number;
}

// Brand Icon - Antigravity Logo
export function AntigravityIcon({ className = '', size = 24 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" fill="url(#antigravity-gradient)" opacity="0.2" />
            <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8v4m0 0l-2-2m2 2l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
            <defs>
                <linearGradient id="antigravity-gradient" x1="4" y1="2" x2="20" y2="20">
                    <stop stopColor="#14b8a6" />
                    <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// Workflow/Flow Icon
export function WorkflowIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
            <rect x="2" y="2" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="13" y="2" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="7.5" y="14" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4.5 6v3a2 2 0 002 2h7a2 2 0 002-2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M10 11v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

// Send/Generate Icon
export function SendIcon({ className = '', size = 18 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
            <path d="M15.5 2.5L8.5 9.5M15.5 2.5L10.5 15.5L8.5 9.5M15.5 2.5L2.5 7.5L8.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Sun Icon for Light Mode
export function SunIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
            <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.66 4.34l-1.42 1.42M5.76 14.24l-1.42 1.42M15.66 15.66l-1.42-1.42M5.76 5.76L4.34 4.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

// Moon Icon for Dark Mode
export function MoonIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
            <path d="M17.5 10.5a7.5 7.5 0 01-10-10 7.5 7.5 0 1010 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Sparkle/AI Icon
export function SparkleIcon({ className = '', size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
            <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 2l.5 1.5L15 4l-1.5.5L13 6l-.5-1.5L11 4l1.5-.5L13 2z" fill="currentColor" />
        </svg>
    );
}

// Check Icon
export function CheckIcon({ className = '', size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
            <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// X/Close Icon
export function CloseIcon({ className = '', size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Loading Dots
export function LoadingDots({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
    );
}

// User Message Icon
export function UserIcon({ className = '', size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 14c0-2.5 2.5-4.5 6-4.5s6 2 6 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

// Bot/Assistant Icon
export function BotIcon({ className = '', size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
            <rect x="2" y="5" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="5.5" cy="9" r="1" fill="currentColor" />
            <circle cx="10.5" cy="9" r="1" fill="currentColor" />
            <path d="M8 2v3M6 2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

// Undo Icon
export function UndoIcon({ className = '', size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M9 14L4 9l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 9h10.5a5.5 5.5 0 015.5 5.5v0a5.5 5.5 0 01-5.5 5.5H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Redo Icon
export function RedoIcon({ className = '', size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M15 14l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 9H9.5A5.5 5.5 0 004 14.5v0A5.5 5.5 0 009.5 20H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Download Icon
export function DownloadIcon({ className = '', size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}


// Trash Icon
export function TrashIcon({ className = '', size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Keyboard shortcut badge
export function KbdBadge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <kbd className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/10 border border-white/20 text-white/60 ${className}`}>
            {children}
        </kbd>
    );
}
