import { BookOpen, GraduationCap, Languages, Moon, Sun, Trophy } from 'lucide-react';
import type { ThemeMode } from '@/src/hooks/useTheme';

export type AppView = 'course' | 'lesson' | 'alphabet' | 'quiz' | 'dashboard';

interface HeaderProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onContinueCourse: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  continueLabel: string;
}

const NAV_ITEMS: { id: Exclude<AppView, 'lesson'>; label: string; icon: typeof BookOpen }[] = [
  { id: 'course', label: 'Trilha', icon: BookOpen },
  { id: 'alphabet', label: 'Alfabeto', icon: Languages },
  { id: 'quiz', label: 'Quizzes', icon: GraduationCap },
  { id: 'dashboard', label: 'Progresso', icon: Trophy },
];

export function Header({
  activeView,
  onNavigate,
  onContinueCourse,
  theme,
  onToggleTheme,
  continueLabel,
}: HeaderProps) {
  const effectiveActive = activeView === 'lesson' ? 'course' : activeView;

  return (
    <header className="sticky top-0 z-30 border-b border-[#E7E2D9] bg-[#FAF8F5]/95 backdrop-blur-sm dark:border-[#262A34] dark:bg-[#14161A]/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:gap-8 sm:px-6 lg:px-8">
        {/* Zona 1: Marca tipográfica única */}
        <button
          type="button"
          onClick={() => onNavigate('course')}
          className="font-display text-xl font-semibold tracking-tight text-[#1F2937] transition-colors hover:text-[#3B5B8C] dark:text-[#F3F0EA] dark:hover:text-[#7FA2D6] whitespace-nowrap shrink-0 cursor-pointer"
        >
          Dobrodošli
        </button>

        {/* Zona 2: Links de navegação em linha única (Desktop) */}
        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = effectiveActive === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#3B5B8C] dark:text-[#7FA2D6] font-semibold'
                    : 'text-[#5A606B] hover:text-[#1F2937] dark:text-[#A3A9B5] dark:hover:text-[#F3F0EA]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[#3B5B8C] dark:bg-[#7FA2D6]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zona 3: Alternador de tema e ação principal */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={
              theme === 'dark'
                ? 'Ativar modo claro'
                : 'Ativar modo escuro'
            }
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2DDD3] bg-white text-[#4A505B] transition-colors hover:bg-[#F3EFE8] hover:text-[#1F2937] dark:border-[#2C313D] dark:bg-[#1C1F26] dark:text-[#C5C9D3] dark:hover:bg-[#262A34] dark:hover:text-white cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={onContinueCourse}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#3B5B8C] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2E4973] dark:bg-[#5E82B8] dark:text-[#0F131A] dark:hover:bg-[#7699CC] whitespace-nowrap shrink-0 cursor-pointer"
          >
            {continueLabel}
          </button>
        </div>
      </div>

      {/* Barra secundária compacta para celular (sem ultrapassar 15% da viewport) */}
      <nav
        aria-label="Navegação móvel"
        className="flex md:hidden items-center justify-around border-t border-[#EFECE6] px-2 py-1.5 dark:border-[#222630]"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = effectiveActive === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'text-[#3B5B8C] bg-[#3B5B8C]/10 dark:text-[#8FB0E3] dark:bg-[#7FA2D6]/15'
                  : 'text-[#5A606B] dark:text-[#A3A9B5]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
