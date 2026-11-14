import { useState } from 'react';
import { Loader2, Volume2 } from 'lucide-react';
import { speakSerbian } from '@/src/utils/speech';

interface AudioButtonProps {
  text: string;
  latin?: string;
  transliteration?: string;
  label?: string;
  compact?: boolean;
}

export function AudioButton({
  text,
  latin,
  transliteration,
  label,
  compact = false,
}: AudioButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing'>('idle');

  const handlePlay = () => {
    void speakSerbian({
      text,
      latin,
      transliteration,
      onStart: () => setStatus('loading'),
      onReady: () => setStatus('playing'),
      onEnd: () => setStatus('idle'),
    });
  };

  const isBusy = status !== 'idle';

  return (
    <button
      type="button"
      onClick={handlePlay}
      aria-label={label || `Ouvir pronúncia de ${latin || text}`}
      aria-pressed={status === 'playing'}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border transition-all duration-150 active:scale-[0.98] cursor-pointer ${
        compact ? 'h-10 w-10' : 'h-10 px-3.5 text-xs font-medium whitespace-nowrap shrink-0'
      } ${
        isBusy
          ? 'border-[#3B5B8C] bg-[#3B5B8C] text-white dark:border-[#7FA2D6] dark:bg-[#5E82B8] dark:text-[#0F131A]'
          : 'border-[#DED8CE] bg-[#FAF8F5] text-[#3B5B8C] hover:border-[#3B5B8C]/50 hover:bg-[#3B5B8C]/8 dark:border-[#2E3340] dark:bg-[#232732] dark:text-[#8FB0E3] dark:hover:border-[#7FA2D6]/50 dark:hover:bg-[#7FA2D6]/15'
      }`}
    >
      {status === 'loading' ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        <Volume2
          className={`h-4 w-4 shrink-0 ${status === 'playing' ? 'scale-110' : ''}`}
          aria-hidden="true"
        />
      )}
      {!compact && (
        <span>
          {status === 'loading'
            ? 'Carregando'
            : status === 'playing'
              ? 'Reproduzindo'
              : 'Ouvir'}
        </span>
      )}
    </button>
  );
}
