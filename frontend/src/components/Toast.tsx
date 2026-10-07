interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 'var(--space-6)',
      right: 'var(--space-6)',
      backgroundColor: 'var(--bg-surface-3)',
      color: 'var(--text-primary)',
      border: '1px solid var(--accent-base)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-3) var(--space-5)',
      fontSize: '13px',
      fontFamily: 'var(--font-mono)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)'
    }}>
      <span style={{ color: 'var(--accent-base)' }}>✓</span>
      <span>{message}</span>
    </div>
  );
}
