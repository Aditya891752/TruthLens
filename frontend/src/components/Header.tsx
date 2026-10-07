import { HealthStatus } from '../types/report';

interface HeaderProps {
  health: HealthStatus | null;
  healthLoading: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  latencyMs?: number;
}

export default function Header({
  health,
  healthLoading,
  activeTab,
  onTabChange,
  latencyMs = 42
}: HeaderProps) {
  const isOnline = health?.status === 'healthy';

  const navItems = [
    { id: 'forensic-audit', label: 'Forensic Audit' },
    { id: 'ground-truth-telemetry', label: 'Ground Truth Telemetry' },
    { id: 'claim-lineage', label: 'Claim Lineage' },
    { id: 'engine-diagnostics', label: 'Engine Diagnostics' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#bfc7d2] shadow-sm">
      <div className="h-16 md:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#f2f3ff] border border-[#bfc7d2] flex items-center justify-center text-[#006194] shrink-0">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#006194"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
              <circle cx="12" cy="12" r="2" fill="#006194" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-sans font-extrabold text-base md:text-lg tracking-tight text-[#131b2e] uppercase">
                TRUTHLENS
              </span>
              <span className="font-mono text-[11px] bg-[#f2f3ff] text-[#3f4850] border border-[#bfc7d2] px-1.5 py-0.5 rounded font-semibold">
                v1.0-grounded
              </span>
            </div>
            <span className="font-sans text-[11px] text-[#707881] hidden sm:block">
              Real-Time AI Output Factuality &amp; Hallucination Forensic Analyzer
            </span>
          </div>
        </div>

        {/* Center Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Forensic Modules">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`text-[13px] font-sans transition-colors cursor-pointer py-1 ${
                  isActive
                    ? 'text-[#006194] font-bold border-b-2 border-[#006194]'
                    : 'text-[#3f4850] hover:text-[#131b2e] font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Telemetry & Status Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* ML Classifier Status Chip */}
          <div
            className="hidden md:flex items-center gap-1.5 font-mono text-[11px] bg-[#ecfdf5] text-[#006c4a] border border-[#a7f3d0] px-2.5 py-1 rounded"
            title="Trained with 19,301 verified facts across 3 training cycles (85.21% validation accuracy)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a] inline-block"></span>
            <span>
              ML Classifier: {health?.ml_model_loaded ? '19.3k Facts Active (85.2% Acc)' : 'Initializing'}
            </span>
          </div>

          {/* Engine Latency Chip */}
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] bg-[#f2f3ff] text-[#3f4850] border border-[#bfc7d2] px-2.5 py-1 rounded">
            <span
              className={`w-1.5 h-1.5 rounded-full inline-block ${
                healthLoading ? 'bg-[#d97706]' : isOnline ? 'bg-[#006c4a]' : 'bg-[#ba1a1a]'
              }`}
            ></span>
            <span>{healthLoading ? 'Connecting...' : isOnline ? 'Engine Online' : 'Engine Offline'}</span>
            <span className="text-[#707881] border-l border-[#bfc7d2] pl-1.5">{latencyMs}ms</span>
          </div>

          {/* Profile / System Icon */}
          <div className="w-8 h-8 rounded-full bg-[#006194] flex items-center justify-center shrink-0 text-white shadow-xs">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
