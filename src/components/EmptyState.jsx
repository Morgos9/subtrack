import { motion } from 'framer-motion';

export default function EmptyState({ onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 2rem',
        gap: '1.5rem',
      }}
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: 'rgba(var(--accent-rgb), 0.12)',
          border: '1px solid rgba(var(--accent-rgb), 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-accent, var(--accent))',
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M2.5 10h19" />
          <path d="M8 15h4" />
          <path d="M15 15h.5" />
        </svg>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.18, ease: 'easeOut' }}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '360px' }}
      >
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'var(--color-text, var(--text-1))',
            margin: 0,
          }}
        >
          Noch keine Abonnements
        </h3>
        <p
          style={{
            fontSize: '0.875rem',
            lineHeight: '1.6',
            color: 'var(--color-text-muted, var(--text-3))',
            margin: 0,
          }}
        >
          Füge dein erstes Abo hinzu und behalte den Überblick über alle laufenden Services.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        type="button"
        onClick={onAdd}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.28, ease: 'easeOut' }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="dashboard-button"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        <span>Erstes Abo hinzufügen</span>
      </motion.button>
    </motion.div>
  );
}
