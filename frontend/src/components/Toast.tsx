interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-8 right-6 z-50 bg-[#0b1c30] text-white px-4 py-2.5 rounded border border-[#bfc7d2] shadow-lg flex items-center gap-2 animate-bounce-short">
      <span className="material-symbols-outlined text-[#85f8c4] text-[18px]">
        check_circle
      </span>
      <span className="font-mono text-xs text-white">{message}</span>
    </div>
  );
}
