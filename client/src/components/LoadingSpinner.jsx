import { motion } from 'framer-motion';
import { Film } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading', fullscreen = false }) {
  const content = (
    <div className="flex flex-col items-center gap-3 py-16 text-smoke">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
      >
        <Film size={28} strokeWidth={1.5} className="text-marquee" />
      </motion.div>
      <span className="text-sm tracking-wide">{label}</span>
    </div>
  );

  if (fullscreen) {
    return <div className="min-h-[60vh] flex items-center justify-center">{content}</div>;
  }
  return content;
}