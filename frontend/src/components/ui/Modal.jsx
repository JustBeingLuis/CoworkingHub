import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/utils';
import { Card } from './Card';

export function Modal({ isOpen, onClose, title, children, className }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <Card className={cn("relative z-50 w-full max-w-lg shadow-xl outline-none overflow-hidden flex flex-col max-h-[90vh]", className)}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:ring-offset-zinc-950 dark:focus:ring-slate-800"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          {children}
        </div>
      </Card>
    </div>
  );
}
