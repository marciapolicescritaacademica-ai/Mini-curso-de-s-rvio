import { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  Flame,
  GraduationCap,
  Lock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import type { BadgeDefinition, QuizAttempt } from '@/src/types/course';
import { COURSE_MODULES, getLessonsForModule } from '@/src/utils/courseData';
import { ProgressBar } from '@/src/components/ProgressBar';

interface DashboardViewProps {
  stats: {
    totalLessons: number;
    completedLessons: number;
    coursePercent: number;
    averageQuizScore: number | null;
    totalQuizAttempts: number;
    streakDays: number;
    badges: (BadgeDefinition & { unlocked: boolean })[];
    unlockedBadgesCount: number;
    completedModulesCount: number;
  };
  quizAttempts: QuizAttempt[];
  getModuleProgress: (moduleId: string) => {
    total: number;
    completed: number;
    percent: number;
    bestAttempt: { percentage: number; passed: boolean } | null;
    isUnlocked: boolean;
  };
  onOpenLesson: (lessonId: string) => void;
  onOpenQuiz: (moduleId: string) => void;
  onResetProgress: () => void;
}

const BADGE_ICONS: Record<BadgeDefinition['iconName'], typeof Award> = {
  compass: Compass,
  book: BookOpen,
  sparkles: Sparkles,
  award: Award,
  flame: Flame,
  graduation: GraduationCap,
};

export function DashboardView({
  stats,
  quizAttempts,
  getModuleProgress,
  onOpenLesson,
  onOpenQuiz,
  onResetProgress,
}: DashboardViewProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F2937] dark:text-[#F3F0EA]">
            Painel de Progresso
          </h1>
          <p className="mt-1 text-base text-[#525864] dark:text-[#B4BAC5]">
            Acompanhe sua evolução no idioma sérvio, desempenho nos quizzes e
            conquistas desbloqueadas.
          </p>
        </div>

        <div>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DFDAD0] bg-white px-3.5 text-xs font-medium text-[#5A606B] transition-colors hover:border-[#B84A4A]/50 hover:text-[#B84A4A] dark:border-[#2A2E39] dark:bg-[#1C1F26] dark:text-[#A3A9B5] dark:hover:text-[#E08A8A] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reiniciar progresso</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-[#B84A4A]/40 bg-[#B84A4A]/8 px-3 py-1.5 dark:border-[#D97373]/40 dark:bg-[#D97373]/15">
              <span className="text-xs font-medium text-[#8F3535] dark:text-[#EDA1A1]">
                Confirmar limpeza?
              </span>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                }}
                className="rounded-lg bg-[#B84A4A] px-2.5 py-1 text-xs font-medium text-white cursor-pointer"
              >
                Sim, reiniciar
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-[#525864] hover:text-[#1F2937] dark:text-[#B4BAC5] cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Faixa de 4 KPIs com numerais tabulares */}
      <section
        aria-label="Indicadores de estudo"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <div className="rounded-2xl border border-[#E6E1D8] bg-white p-5 dark:border-[#2A2E39] dark:bg-[#1C1F26]">
          <p className="text-xs font-medium text-[#5A606B] dark:text-[#9CA3AF]">
            Aulas concluídas
          </p>
          <p className="mt-2 font-display text-3xl font-semibold font-mono tabular-nums text-[#1F2937] dark:text-[#F3F0EA]">
            {stats.completedLessons}{' '}
            <span className="text-base font-normal text-[#6B7280] dark:text-[#9CA3AF]">
              / {stats.totalLessons}
            </span>
          </p>
          <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            {stats.completedModulesCount} de {COURSE_MODULES.length} módulos completos
          </p>
        </div>

        <div className="rounded-2xl border border-[#E6E1D8] bg-white p-5 dark:border-[#2A2E39] dark:bg-[#1C1F26]">
          <p className="text-xs font-medium text-[#5A606B] dark:text-[#9CA3AF]">
            Conclusão do curso
          </p>
          <p className="mt-2 font-display text-3xl font-semibold font-mono tabular-nums text-[#3B5B8C] dark:text-[#8FB0E3]">
            {stats.coursePercent}%
          </p>
          <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            Progresso salvo localmente
          </p>
        </div>

        <div className="rounded-2xl border border-[#E6E1D8] bg-white p-5 dark:border-[#2A2E39] dark:bg-[#1C1F26]">
          <p className="text-xs font-medium text-[#5A606B] dark:text-[#9CA3AF]">
            Média nos quizzes
          </p>
          <p className="mt-2 font-display text-3xl font-semibold font-mono tabular-nums text-[#3E7A5B] dark:text-[#66B88C]">
            {stats.averageQuizScore !== null ? `${stats.averageQuizScore}%` : '—'}
          </p>
          <p className="mt-1 text-xs font-mono tabular-nums text-[#6B7280] dark:text-[#9CA3AF]">
            {stats.totalQuizAttempts}{' '}
            {stats.totalQuizAttempts === 1 ? 'tentativa registrada' : 'tentativas registradas'}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E6E1D8] bg-white p-5 dark:border-[#2A2E39] dark:bg-[#1C1F26]">
          <p className="text-xs font-medium text-[#5A606B] dark:text-[#9CA3AF]">
            Sequência de estudo
          </p>
          <p className="mt-2 font-display text-3xl font-semibold font-mono tabular-nums text-[#B84A4A] dark:text-[#E08A8A]">
            {stats.streakDays}{' '}
            <span className="text-base font-normal text-[#6B7280] dark:text-[#9CA3AF]">
              {stats.streakDays === 1 ? 'dia' : 'dias'}
            </span>
          </p>
          <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            Dias consecutivos ativos
          </p>
        </div>
      </section>

      {/* Progresso por módulo */}
      <section
        aria-labelledby="module-breakdown-heading"
        className="rounded-2xl border border-[#E6E1D8] bg-white p-6 sm:p-8 dark:border-[#2A2E39] dark:bg-[#1C1F26]"
      >
        <div className="border-b border-[#EFECE6] pb-4 dark:border-[#262A34]">
          <h2
            id="module-breakdown-heading"
            className="font-display text-2xl font-semibold text-[#1F2937] dark:text-[#F3F0EA]"
          >
            Trilha por Módulo
          </h2>
        </div>

        <div className="mt-5 divide-y divide-[#EFECE6] dark:divide-[#262A34]">
          {COURSE_MODULES.map((mod) => {
            const mp = getModuleProgress(mod.id);
            const modLessons = getLessonsForModule(mod.id);
            const firstLesson = modLessons[0];
            return (
              <div
                key={mod.id}
                className="grid grid-cols-1 gap-4 py-4 lg:grid-cols-12 lg:items-center"
              >
                <div className="lg:col-span-5 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    <span className="font-semibold text-[#B84A4A] dark:text-[#E08A8A]">
                      Módulo {String(mod.order).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{mod.level}</span>
                    {mp.bestAttempt && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-[#3E7A5B] dark:text-[#66B88C]">
                          Melhor quiz: {mp.bestAttempt.percentage}%
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-base font-semibold text-[#1F2937] dark:text-[#F3F0EA]">
                    {mod.title}
                  </p>
                </div>

                <div className="lg:col-span-4">
                  <ProgressBar
                    value={mp.percent}
                    label={`${mp.completed} de ${mp.total} aulas`}
                    tone={mp.percent === 100 ? 'sage' : 'blue'}
                    size="sm"
                  />
                </div>

                <div className="lg:col-span-3 flex flex-wrap items-center justify-start gap-2 lg:justify-end">
                  {firstLesson && (
                    <button
                      type="button"
                      disabled={!mp.isUnlocked}
                      onClick={() => onOpenLesson(firstLesson.id)}
                      className="rounded-xl border border-[#DFDAD0] bg-[#FAF8F5] px-3 py-1.5 text-xs font-medium text-[#374151] hover:border-[#3B5B8C] disabled:opacity-50 dark:border-[#2E3340] dark:bg-[#232732] dark:text-[#E5E7EB] cursor-pointer disabled:cursor-not-allowed"
                    >
                      Aulas
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!mp.isUnlocked}
                    onClick={() => onOpenQuiz(mod.id)}
                    className="rounded-xl bg-[#3B5B8C]/10 px-3 py-1.5 text-xs font-medium text-[#3B5B8C] hover:bg-[#3B5B8C]/18 disabled:opacity-50 dark:bg-[#7FA2D6]/15 dark:text-[#8FB0E3] cursor-pointer disabled:cursor-not-allowed"
                  >
                    Quiz
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Conquistas / Badges */}
      <section aria-labelledby="badges-heading" className="space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2
            id="badges-heading"
            className="font-display text-2xl font-semibold text-[#1F2937] dark:text-[#F3F0EA]"
          >
            Conquistas
          </h2>
          <span className="font-mono tabular-nums text-xs font-medium text-[#5A606B] dark:text-[#9CA3AF]">
            {stats.unlockedBadgesCount} de {stats.badges.length} desbloqueadas
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.badges.map((badge) => {
            const Icon = BADGE_ICONS[badge.iconName];
            return (
              <div
                key={badge.id}
                className={`flex flex-col justify-between rounded-2xl border p-5 transition-colors ${
                  badge.unlocked
                    ? 'border-[#3B5B8C]/35 bg-white dark:border-[#6B8EC2]/40 dark:bg-[#1C1F26]'
                    : 'border-[#EAE6DD] bg-[#F6F3ED]/75 opacity-80 dark:border-[#242832] dark:bg-[#171A20]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      badge.unlocked
                        ? 'bg-[#3B5B8C]/12 text-[#3B5B8C] dark:bg-[#7FA2D6]/20 dark:text-[#8FB0E3]'
                        : 'bg-[#E8E3DA] text-[#8B8680] dark:bg-[#232732] dark:text-[#6B7280]'
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      {badge.unlocked ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#3E7A5B] dark:text-[#66B88C]">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Conquistada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#747A86] dark:text-[#8E95A2]">
                          <Lock className="h-3 w-3" aria-hidden="true" />
                          {badge.criteriaLabel}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-[#1F2937] dark:text-[#F3F0EA]">
                      {badge.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#525864] dark:text-[#A3A9B5]">
                      {badge.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Resumo recente dos quizzes */}
      {quizAttempts.length > 0 && (
        <section
          aria-labelledby="recent-attempts-heading"
          className="rounded-2xl border border-[#E6E1D8] bg-white p-6 dark:border-[#2A2E39] dark:bg-[#1C1F26]"
        >
          <h2
            id="recent-attempts-heading"
            className="font-display text-xl font-semibold text-[#1F2937] dark:text-[#F3F0EA]"
          >
            Últimos Quizzes Realizados
          </h2>
          <div className="mt-4 divide-y divide-[#EFECE6] dark:divide-[#262A34]">
            {quizAttempts.slice(0, 5).map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="font-medium text-[#1F2937] dark:text-[#F3F0EA]">
                  {att.moduleTitle}
                </span>
                <span
                  className={`font-mono tabular-nums font-semibold ${
                    att.passed
                      ? 'text-[#3E7A5B] dark:text-[#66B88C]'
                      : 'text-[#B84A4A] dark:text-[#E08A8A]'
                  }`}
                >
                  {att.score}/{att.totalQuestions} ({att.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
