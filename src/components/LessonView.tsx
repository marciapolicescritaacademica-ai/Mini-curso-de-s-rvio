import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  EyeOff,
  GraduationCap,
  Lightbulb,
} from 'lucide-react';
import type { LessonStatus } from '@/src/types/course';
import {
  getLessonById,
  getLessonsForModule,
  getModuleById,
  getOrderedLessons,
  getQuizForModule,
} from '@/src/utils/courseData';
import { AudioButton } from '@/src/components/AudioButton';
import { AlphabetBoard } from '@/src/components/AlphabetBoard';
import { ProgressBar } from '@/src/components/ProgressBar';

interface LessonViewProps {
  lessonId: string;
  isCompleted: boolean;
  getLessonStatus: (lessonId: string) => LessonStatus;
  onToggleComplete: (lessonId: string) => void;
  onSelectLesson: (lessonId: string) => void;
  onBackToCourse: () => void;
  onStartModuleQuiz: (moduleId: string) => void;
}

export function LessonView({
  lessonId,
  isCompleted,
  getLessonStatus,
  onToggleComplete,
  onSelectLesson,
  onBackToCourse,
  onStartModuleQuiz,
}: LessonViewProps) {
  const [hideLatinHelper, setHideLatinHelper] = useState(false);

  const lesson = getLessonById(lessonId);
  const module = lesson ? getModuleById(lesson.moduleId) : undefined;
  const orderedLessons = useMemo(() => getOrderedLessons(), []);

  if (!lesson || !module) {
    return (
      <div className="rounded-2xl border border-[#E6E1D8] bg-white p-8 text-center dark:border-[#2A2E39] dark:bg-[#1C1F26]">
        <p className="text-sm text-[#525864] dark:text-[#B4BAC5]">
          Aula não encontrada.
        </p>
        <button
          type="button"
          onClick={onBackToCourse}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#3B5B8C] px-4 text-sm font-medium text-white cursor-pointer"
        >
          Voltar para a trilha
        </button>
      </div>
    );
  }

  const moduleLessons = getLessonsForModule(module.id);
  const completedInModule = moduleLessons.filter(
    (l) => getLessonStatus(l.id) === 'completed'
  ).length;
  const modulePercent = Math.round(
    (completedInModule / Math.max(1, moduleLessons.length)) * 100
  );

  const currentIndex = orderedLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? orderedLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < orderedLessons.length - 1
      ? orderedLessons[currentIndex + 1]
      : null;

  const isLastInModule =
    moduleLessons[moduleLessons.length - 1]?.id === lesson.id;
  const moduleQuiz = getQuizForModule(module.id);

  // Próxima aula pode estar bloqueada apenas se o usuário ainda não concluiu esta aula e freeExploreMode está desligado
  const nextLessonStatus = nextLesson ? getLessonStatus(nextLesson.id) : null;
  const canOpenNext =
    nextLesson !== null && (isCompleted || nextLessonStatus !== 'locked');

  const handleMarkAndContinue = () => {
    if (!isCompleted) {
      onToggleComplete(lesson.id);
    }
    if (nextLesson) {
      onSelectLesson(nextLesson.id);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Navegação superior e progresso da aula/módulo */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToCourse}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#5A606B] transition-colors hover:text-[#1F2937] dark:text-[#A3A9B5] dark:hover:text-[#F3F0EA] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Voltar à trilha</span>
          </button>

          <button
            type="button"
            onClick={() => setHideLatinHelper((prev) => !prev)}
            aria-pressed={hideLatinHelper}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#DFDAD0] bg-white px-3 text-xs font-medium text-[#4A505B] transition-colors hover:border-[#3B5B8C]/40 dark:border-[#2A2E39] dark:bg-[#1C1F26] dark:text-[#C5C9D3] cursor-pointer"
          >
            {hideLatinHelper ? (
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>
              {hideLatinHelper
                ? 'Mostrar transliteração latina'
                : 'Ocultar latino (praticar cirílico)'}
            </span>
          </button>
        </div>

        <div className="rounded-2xl border border-[#E6E1D8] bg-white p-6 sm:p-8 dark:border-[#2A2E39] dark:bg-[#1C1F26]">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A606B] dark:text-[#9CA3AF]">
            <span className="font-semibold text-[#B84A4A] dark:text-[#E08A8A]">
              Módulo {String(module.order).padStart(2, '0')} · {module.title}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Aula {lesson.order} de {moduleLessons.length}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 font-mono tabular-nums">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {lesson.durationMinutes} min
            </span>
            <span aria-hidden="true">·</span>
            <span>{lesson.level}</span>
          </div>

          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#1F2937] dark:text-[#F3F0EA] text-balance">
            {lesson.title}
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#525864] dark:text-[#B4BAC5]">
            {lesson.summary}
          </p>

          <div className="mt-6 border-t border-[#EFECE6] pt-5 dark:border-[#262A34]">
            <ProgressBar
              value={modulePercent}
              label={`Progresso no módulo (${completedInModule} de ${moduleLessons.length} aulas concluídas)`}
              tone={modulePercent === 100 ? 'sage' : 'blue'}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Conteúdo textual e exemplos da aula */}
      <div className="space-y-8">
        {lesson.sections.map((section, idx) => (
          <section
            key={section.heading}
            aria-labelledby={`sec-${idx}`}
            className="rounded-2xl border border-[#E6E1D8] bg-white p-6 sm:p-8 dark:border-[#2A2E39] dark:bg-[#1C1F26] space-y-5"
          >
            <h2
              id={`sec-${idx}`}
              className="font-display text-xl sm:text-2xl font-semibold text-[#1F2937] dark:text-[#F3F0EA]"
            >
              {section.heading}
            </h2>

            <div className="max-w-[68ch] space-y-3 text-[15px] sm:text-base leading-[1.7] text-[#2B303A] dark:text-[#D9D6CF]">
              {section.paragraphs.map((p, pIdx) => (
                <p key={pIdx}>{p}</p>
              ))}
            </div>

            {section.tip && (
              <div className="flex items-start gap-3 rounded-xl border border-[#E2DDD3] bg-[#F7F4EE] p-4 dark:border-[#2D3340] dark:bg-[#232732]">
                <Lightbulb
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#B87A2E] dark:text-[#E0A75E]"
                  aria-hidden="true"
                />
                <p className="text-sm leading-relaxed text-[#3E434E] dark:text-[#C8CDD8]">
                  <span className="font-semibold text-[#1F2937] dark:text-[#F3F0EA]">
                    Dica de estudo:{' '}
                  </span>
                  {section.tip}
                </p>
              </div>
            )}

            {section.examples && section.examples.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                  Palavras e frases com áudio
                </h3>
                <div className="divide-y divide-[#EFECE6] rounded-xl border border-[#EAE5DC] dark:divide-[#262A34] dark:border-[#2A2E39]">
                  {section.examples.map((ex) => (
                    <div
                      key={ex.id}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="text-xl font-semibold text-[#1F2937] dark:text-[#F3F0EA]">
                            {ex.cyrillic}
                          </span>
                          {!hideLatinHelper && (
                            <span className="text-base font-medium text-[#3B5B8C] dark:text-[#8FB0E3]">
                              {ex.latin}
                            </span>
                          )}
                          <span className="text-xs font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                            [{ex.transliteration}]
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">
                          {ex.portuguese}
                        </p>
                        {ex.note && (
                          <p className="text-xs leading-relaxed text-[#6B7280] dark:text-[#9CA3AF]">
                            {ex.note}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <AudioButton
                          text={ex.cyrillic}
                          latin={ex.latin}
                          transliteration={ex.transliteration}
                          label={`Ouvir pronúncia de ${ex.latin}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}

        {/* Painel interativo do alfabeto quando incluído na aula */}
        {lesson.includesAlphabetBoard && (
          <div className="rounded-2xl border border-[#E6E1D8] bg-[#FAF8F5] p-5 sm:p-7 dark:border-[#2A2E39] dark:bg-[#171A20]">
            <AlphabetBoard compact />
          </div>
        )}
      </div>

      {/* Rodapé de ações da aula: anterior / concluir / próxima */}
      <footer className="rounded-2xl border border-[#E6E1D8] bg-white p-5 sm:p-6 dark:border-[#2A2E39] dark:bg-[#1C1F26]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!prevLesson}
              onClick={() => prevLesson && onSelectLesson(prevLesson.id)}
              className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                prevLesson
                  ? 'border-[#DED8CE] bg-white text-[#374151] hover:bg-[#F5F2EC] dark:border-[#2E3340] dark:bg-[#232732] dark:text-[#E5E7EB] dark:hover:bg-[#2B303D] cursor-pointer'
                  : 'border-[#EDEAE3] bg-[#F8F6F2] text-[#A19C94] cursor-not-allowed dark:border-[#242832] dark:bg-[#181B21] dark:text-[#5B606B]'
              }`}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Aula anterior</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onToggleComplete(lesson.id)}
              aria-pressed={isCompleted}
              className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isCompleted
                  ? 'border-[#3E7A5B] bg-[#3E7A5B]/10 text-[#2E5E45] hover:bg-[#3E7A5B]/15 dark:border-[#5BA880] dark:bg-[#5BA880]/15 dark:text-[#7FD1A6]'
                  : 'border-[#3B5B8C] bg-white text-[#3B5B8C] hover:bg-[#3B5B8C]/8 dark:border-[#7FA2D6] dark:bg-[#1C1F26] dark:text-[#8FB0E3] dark:hover:bg-[#7FA2D6]/15'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Circle className="h-4 w-4" aria-hidden="true" />
              )}
              <span>
                {isCompleted ? 'Aula concluída' : 'Marcar como concluída'}
              </span>
            </button>

            {isLastInModule && moduleQuiz && (
              <button
                type="button"
                onClick={() => {
                  if (!isCompleted) onToggleComplete(lesson.id);
                  onStartModuleQuiz(module.id);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#B84A4A] px-4 text-sm font-medium text-white transition-colors hover:bg-[#9E3D3D] dark:bg-[#C96464] dark:text-[#14161A] dark:hover:bg-[#D97878] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
                <span>Fazer quiz do módulo</span>
              </button>
            )}

            {nextLesson && (
              <button
                type="button"
                onClick={handleMarkAndContinue}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#3B5B8C] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2E4973] dark:bg-[#5E82B8] dark:text-[#0F131A] dark:hover:bg-[#7699CC] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>
                  {canOpenNext
                    ? 'Próxima aula'
                    : 'Concluir e avançar'}
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
