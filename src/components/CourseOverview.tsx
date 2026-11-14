import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  GraduationCap,
  Lock,
  PlayCircle,
  Unlock,
} from 'lucide-react';
import { COURSE_MODULES, getLessonsForModule, getQuizForModule } from '@/src/utils/courseData';
import type { CourseModule, Lesson, LessonStatus } from '@/src/types/course';
import { ProgressBar } from '@/src/components/ProgressBar';

type ModuleFilter = 'all' | 'active' | 'completed';

interface CourseOverviewProps {
  coursePercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  freeExploreMode: boolean;
  onToggleFreeExplore: () => void;
  getLessonStatus: (lessonId: string) => LessonStatus;
  getModuleProgress: (moduleId: string) => {
    total: number;
    completed: number;
    percent: number;
    bestAttempt: { percentage: number; passed: boolean } | null;
    isUnlocked: boolean;
  };
  onOpenLesson: (lessonId: string) => void;
  onOpenQuiz: (moduleId: string) => void;
  nextRecommendedLesson: Lesson;
}

const STATUS_META: Record<
  LessonStatus,
  { label: string; colorClass: string; Icon: typeof CheckCircle2 }
> = {
  completed: {
    label: 'Concluída',
    colorClass: 'text-[#3E7A5B] dark:text-[#66B88C]',
    Icon: CheckCircle2,
  },
  in_progress: {
    label: 'Em andamento',
    colorClass: 'text-[#3B5B8C] dark:text-[#8FB0E3]',
    Icon: PlayCircle,
  },
  available: {
    label: 'Disponível',
    colorClass: 'text-[#5A606B] dark:text-[#B4BAC5]',
    Icon: PlayCircle,
  },
  locked: {
    label: 'Bloqueada',
    colorClass: 'text-[#8B8680] dark:text-[#7A808D]',
    Icon: Lock,
  },
};

export function CourseOverview({
  coursePercent,
  completedLessonsCount,
  totalLessonsCount,
  freeExploreMode,
  onToggleFreeExplore,
  getLessonStatus,
  getModuleProgress,
  onOpenLesson,
  onOpenQuiz,
  nextRecommendedLesson,
}: CourseOverviewProps) {
  const [filter, setFilter] = useState<ModuleFilter>('all');
  const [imageError, setImageError] = useState(false);

  const visibleModules = useMemo(() => {
    return COURSE_MODULES.filter((mod) => {
      const mp = getModuleProgress(mod.id);
      if (filter === 'completed') return mp.percent === 100;
      if (filter === 'active') return mp.percent < 100 && mp.isUnlocked;
      return true;
    });
  }, [filter, getModuleProgress]);

  return (
    <div className="space-y-12">
      {/* Seção Hero em 2 colunas balanceadas */}
      <section
        aria-labelledby="hero-title"
        className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch"
      >
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-[#E6E1D8] bg-white p-7 sm:p-9 dark:border-[#2A2E39] dark:bg-[#1C1F26]">
          <div className="space-y-4">
            <p className="text-xs font-medium tracking-wide text-[#B84A4A] dark:text-[#E08A8A]">
              Minicurso de Língua Sérvia · Nível Iniciante
            </p>
            <h1
              id="hero-title"
              className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-semibold leading-[1.15] tracking-tight text-[#1F2937] dark:text-[#F3F0EA] text-balance"
            >
              Aprenda a ler em cirílico e conversar em sérvio passo a passo
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[#525864] dark:text-[#B4BAC5]">
              Lições curtas em português com transliteração clara, áudio de
              pronúncia, notas culturais e quizzes interativos por módulo para
              fixar cada etapa no seu ritmo.
            </p>
          </div>

          <div className="mt-8 space-y-5 border-t border-[#EFECE6] pt-6 dark:border-[#262A34]">
            <ProgressBar
              value={coursePercent}
              label={`Progresso geral do curso (${completedLessonsCount} de ${totalLessonsCount} aulas)`}
              tone={coursePercent === 100 ? 'sage' : 'blue'}
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenLesson(nextRecommendedLesson.id)}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#3B5B8C] px-5 text-sm font-medium text-white transition-colors hover:bg-[#2E4973] active:scale-[0.99] dark:bg-[#5E82B8] dark:text-[#0F131A] dark:hover:bg-[#7699CC] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>
                  {completedLessonsCount === 0
                    ? 'Começar primeira aula'
                    : 'Continuar próxima aula'}
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                Próxima: {nextRecommendedLesson.title}
              </span>
            </div>
          </div>
        </div>

        {/* Ilustração editorial de Belgrado */}
        <div className="lg:col-span-5 overflow-hidden rounded-2xl border border-[#E6E1D8] bg-[#EAE3D7] dark:border-[#2A2E39] dark:bg-[#222630]">
          {!imageError ? (
            <img
              src="/src/assets/images/belgrade_editorial_hero_1794681020489.jpg"
              alt="Ilustração editorial da Fortaleza de Kalemegdan em Belgrado na confluência dos rios Sava e Danúbio"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="h-60 w-full object-cover lg:h-full"
            />
          ) : (
            <div className="flex h-60 w-full flex-col items-center justify-center bg-gradient-to-br from-[#3B5B8C]/15 via-[#FAF8F5] to-[#B84A4A]/15 p-8 text-center lg:h-full dark:from-[#3B5B8C]/25 dark:via-[#1C1F26] dark:to-[#B84A4A]/20">
              <span className="font-display text-3xl font-semibold text-[#3B5B8C] dark:text-[#8FB0E3]">
                Добродошли
              </span>
              <span className="mt-2 text-sm text-[#525864] dark:text-[#B4BAC5]">
                Belgrado · Língua e Cultura Sérvia
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Barra de controle da trilha */}
      <section aria-labelledby="modules-heading" className="space-y-8">
        <div className="flex flex-col gap-4 border-b border-[#E7E2D9] pb-5 sm:flex-row sm:items-end sm:justify-between dark:border-[#262A34]">
          <div>
            <h2
              id="modules-heading"
              className="font-display text-2xl sm:text-3xl font-semibold text-[#1F2937] dark:text-[#F3F0EA]"
            >
              Trilha de Módulos e Aulas
            </h2>
            <p className="mt-1 text-sm text-[#5A606B] dark:text-[#A3A9B5]">
              Conclua as aulas em sequência ou ative a exploração livre para
              acessar qualquer tópico imediatamente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="tablist"
              aria-label="Filtrar módulos"
              className="flex items-center gap-1 rounded-xl bg-[#EFECE6] p-1 dark:bg-[#1E222B]"
            >
              {[
                { id: 'all', label: 'Todos' },
                { id: 'active', label: 'Em aberto' },
                { id: 'completed', label: 'Concluídos' },
              ].map((tab) => {
                const active = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(tab.id as ModuleFilter)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white text-[#1F2937] shadow-xs dark:bg-[#2C313D] dark:text-[#F3F0EA]'
                        : 'text-[#5A606B] hover:text-[#1F2937] dark:text-[#A3A9B5] dark:hover:text-[#F3F0EA]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onToggleFreeExplore}
              aria-pressed={freeExploreMode}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                freeExploreMode
                  ? 'border-[#3B5B8C] bg-[#3B5B8C]/10 text-[#3B5B8C] dark:border-[#7FA2D6] dark:bg-[#7FA2D6]/15 dark:text-[#8FB0E3]'
                  : 'border-[#DFDAD0] bg-white text-[#525864] hover:border-[#3B5B8C]/40 dark:border-[#2A2E39] dark:bg-[#1C1F26] dark:text-[#B4BAC5]'
              }`}
            >
              {freeExploreMode ? (
                <Unlock className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>
                {freeExploreMode ? 'Acesso livre ativo' : 'Desbloquear todas'}
              </span>
            </button>
          </div>
        </div>

        {visibleModules.length === 0 ? (
          <div className="rounded-2xl border border-[#E6E1D8] bg-white p-10 text-center dark:border-[#2A2E39] dark:bg-[#1C1F26]">
            <p className="text-sm text-[#5A606B] dark:text-[#A3A9B5]">
              Nenhum módulo corresponde a este filtro no momento.
            </p>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="mt-3 text-sm font-medium text-[#3B5B8C] hover:underline dark:text-[#8FB0E3] cursor-pointer"
            >
              Mostrar todos os módulos
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {visibleModules.map((mod) => (
              <ModuleSection
                key={mod.id}
                module={mod}
                moduleProgress={getModuleProgress(mod.id)}
                getLessonStatus={getLessonStatus}
                onOpenLesson={onOpenLesson}
                onOpenQuiz={onOpenQuiz}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface ModuleSectionProps {
  module: CourseModule;
  moduleProgress: {
    total: number;
    completed: number;
    percent: number;
    bestAttempt: { percentage: number; passed: boolean } | null;
    isUnlocked: boolean;
  };
  getLessonStatus: (lessonId: string) => LessonStatus;
  onOpenLesson: (lessonId: string) => void;
  onOpenQuiz: (moduleId: string) => void;
}

function ModuleSection({
  module,
  moduleProgress,
  getLessonStatus,
  onOpenLesson,
  onOpenQuiz,
}: ModuleSectionProps) {
  const lessons = getLessonsForModule(module.id);
  const quiz = getQuizForModule(module.id);

  return (
    <article
      aria-labelledby={`mod-title-${module.id}`}
      className="space-y-5"
    >
      {/* Cabeçalho limpo do módulo sem borda externa aninhada */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A606B] dark:text-[#9CA3AF]">
            <span className="font-semibold text-[#B84A4A] dark:text-[#E08A8A]">
              Módulo {String(module.order).padStart(2, '0')}
            </span>
            <span aria-hidden="true">·</span>
            <span>{module.level}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {module.estimatedMinutes} min
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {moduleProgress.completed}/{moduleProgress.total} aulas
            </span>
          </div>
          <h3
            id={`mod-title-${module.id}`}
            className="font-display text-2xl font-semibold text-[#1F2937] dark:text-[#F3F0EA]"
          >
            {module.title}
          </h3>
          <p className="max-w-2xl text-sm leading-relaxed text-[#525864] dark:text-[#B4BAC5]">
            {module.description}
          </p>
        </div>

        <div className="lg:col-span-4">
          <ProgressBar
            value={moduleProgress.percent}
            label="Progresso do módulo"
            tone={moduleProgress.percent === 100 ? 'sage' : 'blue'}
            size="sm"
          />
        </div>
      </div>

      {/* Grade de cards das aulas + card do quiz */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => {
          const status = getLessonStatus(lesson.id);
          const meta = STATUS_META[status];
          const StatusIcon = meta.Icon;
          const isLocked = status === 'locked';

          return (
            <button
              key={lesson.id}
              type="button"
              disabled={isLocked}
              onClick={() => onOpenLesson(lesson.id)}
              aria-label={`${lesson.title} — ${meta.label}`}
              className={`group flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-150 ${
                isLocked
                  ? 'border-[#EAE6DD] bg-[#F5F2EC]/70 opacity-75 cursor-not-allowed dark:border-[#242832] dark:bg-[#181B21]/70'
                  : 'border-[#E6E1D8] bg-white hover:-translate-y-0.5 hover:border-[#3B5B8C]/45 hover:shadow-sm active:translate-y-0 dark:border-[#2A2E39] dark:bg-[#1C1F26] dark:hover:border-[#7FA2D6]/50 cursor-pointer'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[#6B7280] dark:text-[#9CA3AF]">
                    Aula {module.order}.{lesson.order} · {lesson.level}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-medium whitespace-nowrap shrink-0 ${meta.colorClass}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{meta.label}</span>
                  </span>
                </div>

                <h4 className="text-base font-semibold leading-snug text-[#1F2937] group-hover:text-[#3B5B8C] dark:text-[#F3F0EA] dark:group-hover:text-[#8FB0E3]">
                  {lesson.title}
                </h4>

                <p className="text-sm leading-relaxed text-[#525864] dark:text-[#A3A9B5] line-clamp-2">
                  {lesson.summary}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#EFECE6] pt-3.5 text-xs dark:border-[#262A34]">
                <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-[#6B7280] dark:text-[#9CA3AF]">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {lesson.durationMinutes} min
                </span>
                <span className="font-medium text-[#3B5B8C] dark:text-[#8FB0E3]">
                  {isLocked ? 'Conclua a anterior' : status === 'completed' ? 'Revisar aula →' : 'Abrir aula →'}
                </span>
              </div>
            </button>
          );
        })}

        {/* Card de Quiz do Módulo */}
        {quiz && (
          <button
            type="button"
            disabled={!moduleProgress.isUnlocked}
            onClick={() => onOpenQuiz(module.id)}
            className={`group flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-150 ${
              !moduleProgress.isUnlocked
                ? 'border-[#EAE6DD] bg-[#F5F2EC]/70 opacity-75 cursor-not-allowed dark:border-[#242832] dark:bg-[#181B21]/70'
                : 'border-[#D8DEE9] bg-[#F3F6FA] hover:-translate-y-0.5 hover:border-[#3B5B8C]/50 hover:shadow-sm dark:border-[#2C3548] dark:bg-[#1D2432] dark:hover:border-[#7FA2D6]/50 cursor-pointer'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-[#3B5B8C] dark:text-[#8FB0E3]">
                  Avaliação do módulo
                </span>
                {moduleProgress.bestAttempt ? (
                  <span
                    className={`font-mono tabular-nums font-semibold ${
                      moduleProgress.bestAttempt.passed
                        ? 'text-[#3E7A5B] dark:text-[#66B88C]'
                        : 'text-[#B84A4A] dark:text-[#E08A8A]'
                    }`}
                  >
                    Melhor: {moduleProgress.bestAttempt.percentage}%
                  </span>
                ) : (
                  <span className="text-[#6B7280] dark:text-[#9CA3AF]">
                    {quiz.questions.length} questões
                  </span>
                )}
              </div>

              <div className="flex items-start gap-2.5">
                <GraduationCap
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#3B5B8C] dark:text-[#8FB0E3]"
                  aria-hidden="true"
                />
                <h4 className="text-base font-semibold leading-snug text-[#1F2937] dark:text-[#F3F0EA]">
                  {quiz.title}
                </h4>
              </div>

              <p className="text-sm leading-relaxed text-[#525864] dark:text-[#B4BAC5] line-clamp-2">
                {quiz.description}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#E1E6EE] pt-3.5 text-xs dark:border-[#2B3345]">
              <span className="text-[#5A606B] dark:text-[#A3A9B5]">
                Múltipla escolha, associação e tradução
              </span>
              <span className="font-medium text-[#3B5B8C] dark:text-[#8FB0E3] whitespace-nowrap shrink-0">
                {!moduleProgress.isUnlocked ? 'Bloqueado' : 'Iniciar quiz →'}
              </span>
            </div>
          </button>
        )}
      </div>
    </article>
  );
}
