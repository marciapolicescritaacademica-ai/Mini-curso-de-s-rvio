import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  History,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import type {
  MatchingQuestion,
  MultipleChoiceQuestion,
  Quiz,
  QuizAttempt,
  QuizQuestion,
  TranslationQuestion,
} from '@/src/types/course';
import { COURSE_MODULES, COURSE_QUIZZES, getModuleById } from '@/src/utils/courseData';
import { ProgressBar } from '@/src/components/ProgressBar';

interface QuizViewProps {
  selectedModuleId: string | null;
  quizAttempts: QuizAttempt[];
  isModuleUnlocked: (moduleId: string) => boolean;
  onSelectModule: (moduleId: string) => void;
  onRecordAttempt: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => void;
  onBackToCourse: () => void;
}

function normalizeAnswer(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'dj')
    .replace(/[.,!?;:()"']/g, '')
    .replace(/\s+/g, ' ');
}

function deterministicShuffle<T>(items: T[], seedStr: string): T[] {
  const arr = [...items];
  let seed = 0;
  for (let i = 0; i < seedStr.length; i += 1) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) % 9973;
  }
  for (let i = arr.length - 1; i > 0; i -= 1) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function QuizView({
  selectedModuleId,
  quizAttempts,
  isModuleUnlocked,
  onSelectModule,
  onRecordAttempt,
  onBackToCourse,
}: QuizViewProps) {
  const activeModuleId = selectedModuleId || COURSE_MODULES[0].id;
  const activeQuiz: Quiz | undefined = COURSE_QUIZZES.find(
    (q) => q.moduleId === activeModuleId
  );
  const activeModule = getModuleById(activeModuleId);

  const [sessionKey, setSessionKey] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Estado por questão
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [questionIsCorrect, setQuestionIsCorrect] = useState<boolean | null>(
    null
  );

  const resetSession = (newModuleId?: string) => {
    if (newModuleId) onSelectModule(newModuleId);
    setSessionKey((k) => k + 1);
    setQuestionIndex(0);
    setCorrectCount(0);
    setIsFinished(false);
    setQuestionSubmitted(false);
    setQuestionIsCorrect(null);
  };

  if (!activeQuiz || !activeModule) {
    return null;
  }

  const totalQuestions = activeQuiz.questions.length;
  const currentQuestion = activeQuiz.questions[questionIndex];
  const progressPercent = isFinished
    ? 100
    : Math.round(((questionIndex + (questionSubmitted ? 1 : 0)) / totalQuestions) * 100);

  const handleQuestionEvaluated = (isCorrect: boolean) => {
    setQuestionSubmitted(true);
    setQuestionIsCorrect(isCorrect);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleAdvance = () => {
    if (questionIndex + 1 < totalQuestions) {
      setQuestionIndex((i) => i + 1);
      setQuestionSubmitted(false);
      setQuestionIsCorrect(null);
    } else {
      const percentage = Math.round((correctCount / totalQuestions) * 100);
      const passed = percentage >= activeQuiz.passingScorePercent;
      onRecordAttempt({
        quizId: activeQuiz.id,
        moduleId: activeModule.id,
        moduleTitle: activeModule.title,
        score: correctCount,
        totalQuestions,
        percentage,
        passed,
      });
      setIsFinished(true);
    }
  };

  const finalPercentage = Math.round((correctCount / totalQuestions) * 100);
  const passedFinal = finalPercentage >= activeQuiz.passingScorePercent;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1F2937] dark:text-[#F3F0EA]">
            Quizzes por Módulo
          </h1>
          <p className="mt-1 text-sm text-[#525864] dark:text-[#B4BAC5]">
            Pratique com questões de múltipla escolha, associação de palavras e
            tradução com feedback imediato.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToCourse}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DFDAD0] bg-white px-3.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F5F2EC] dark:border-[#2A2E39] dark:bg-[#1C1F26] dark:text-[#E5E7EB] dark:hover:bg-[#262A34] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Voltar à trilha</span>
        </button>
      </div>

      {/* Seletor de módulo */}
      <div
        role="tablist"
        aria-label="Selecionar quiz do módulo"
        className="flex flex-wrap gap-2"
      >
        {COURSE_MODULES.map((mod) => {
          const unlocked = isModuleUnlocked(mod.id);
          const selected = mod.id === activeModuleId;
          return (
            <button
              key={mod.id}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={!unlocked}
              onClick={() => resetSession(mod.id)}
              className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                !unlocked
                  ? 'border-[#EAE6DD] bg-[#F5F2EC]/70 text-[#9A958E] cursor-not-allowed dark:border-[#242832] dark:bg-[#181B21] dark:text-[#5B606B]'
                  : selected
                    ? 'border-[#3B5B8C] bg-[#3B5B8C] text-white dark:border-[#6B8EC2] dark:bg-[#5E82B8] dark:text-[#0F131A] cursor-pointer'
                    : 'border-[#DFDAD0] bg-white text-[#4A505B] hover:border-[#3B5B8C]/50 dark:border-[#2A2E39] dark:bg-[#1C1F26] dark:text-[#C5C9D3] cursor-pointer'
              }`}
            >
              Módulo {mod.order}
            </button>
          );
        })}
      </div>

      {/* Área principal do quiz ativo */}
      <section
        aria-live="polite"
        className="rounded-2xl border border-[#E6E1D8] bg-white p-6 sm:p-8 dark:border-[#2A2E39] dark:bg-[#1C1F26]"
      >
        <div className="space-y-4 border-b border-[#EFECE6] pb-6 dark:border-[#262A34]">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-[#B84A4A] dark:text-[#E08A8A]">
                Módulo {String(activeModule.order).padStart(2, '0')} ·{' '}
                {activeModule.title}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-[#1F2937] dark:text-[#F3F0EA]">
                {activeQuiz.title}
              </h2>
            </div>
            {!isFinished && (
              <span className="font-mono tabular-nums text-xs font-medium text-[#5A606B] dark:text-[#9CA3AF]">
                Questão {questionIndex + 1} de {totalQuestions}
              </span>
            )}
          </div>

          <ProgressBar
            value={progressPercent}
            label={isFinished ? 'Quiz finalizado' : 'Andamento do quiz'}
            tone={isFinished ? (passedFinal ? 'sage' : 'rose') : 'blue'}
            size="sm"
          />
        </div>

        {!isFinished ? (
          <div key={`${activeQuiz.id}-${currentQuestion.id}-${sessionKey}`} className="mt-6 space-y-6">
            <QuestionRenderer
              question={currentQuestion}
              submitted={questionSubmitted}
              onEvaluate={handleQuestionEvaluated}
            />

            {questionSubmitted && (
              <div
                role="status"
                className={`rounded-xl border p-4 ${
                  questionIsCorrect
                    ? 'border-[#3E7A5B]/35 bg-[#3E7A5B]/8 dark:border-[#5BA880]/40 dark:bg-[#5BA880]/12'
                    : 'border-[#B84A4A]/35 bg-[#B84A4A]/8 dark:border-[#D97373]/40 dark:bg-[#D97373]/12'
                }`}
              >
                <div className="flex items-start gap-3">
                  {questionIsCorrect ? (
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#3E7A5B] dark:text-[#66B88C]"
                      aria-hidden="true"
                    />
                  ) : (
                    <XCircle
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#B84A4A] dark:text-[#E08A8A]"
                      aria-hidden="true"
                    />
                  )}
                  <div className="space-y-1">
                    <p
                      className={`text-sm font-semibold ${
                        questionIsCorrect
                          ? 'text-[#2E5E45] dark:text-[#7FD1A6]'
                          : 'text-[#8F3535] dark:text-[#EDA1A1]'
                      }`}
                    >
                      {questionIsCorrect ? 'Resposta correta!' : 'Quase lá — veja a explicação:'}
                    </p>
                    <p className="text-sm leading-relaxed text-[#374151] dark:text-[#D1D5DB]">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAdvance}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#3B5B8C] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2E4973] dark:bg-[#5E82B8] dark:text-[#0F131A] dark:hover:bg-[#7699CC] cursor-pointer"
                  >
                    <span>
                      {questionIndex + 1 < totalQuestions
                        ? 'Próxima questão'
                        : 'Ver resultado final'}
                    </span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 space-y-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B5B8C]/10 text-[#3B5B8C] dark:bg-[#7FA2D6]/15 dark:text-[#8FB0E3]">
              <GraduationCap className="h-7 w-7" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <p
                className={`text-sm font-semibold ${
                  passedFinal
                    ? 'text-[#3E7A5B] dark:text-[#66B88C]'
                    : 'text-[#B84A4A] dark:text-[#E08A8A]'
                }`}
              >
                {passedFinal
                  ? 'Aprovado no módulo!'
                  : `Recomendado revisar (mínimo ${activeQuiz.passingScorePercent}%)`}
              </p>
              <h3 className="font-display text-3xl font-semibold font-mono tabular-nums text-[#1F2937] dark:text-[#F3F0EA]">
                {correctCount} / {totalQuestions} acertos ({finalPercentage}%)
              </h3>
              <p className="mx-auto max-w-md text-sm text-[#525864] dark:text-[#B4BAC5]">
                Seu resultado foi salvo automaticamente no histórico abaixo e já
                conta para sua média no painel de progresso.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => resetSession()}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#3B5B8C] px-5 text-sm font-medium text-white transition-colors hover:bg-[#2E4973] dark:bg-[#5E82B8] dark:text-[#0F131A] cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Refazer quiz</span>
              </button>
              <button
                type="button"
                onClick={onBackToCourse}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DFDAD0] bg-white px-5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F5F2EC] dark:border-[#2E3340] dark:bg-[#232732] dark:text-[#E5E7EB] cursor-pointer"
              >
                <span>Voltar aos módulos</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Histórico de resultados */}
      <section
        aria-labelledby="quiz-history-heading"
        className="rounded-2xl border border-[#E6E1D8] bg-white p-6 sm:p-8 dark:border-[#2A2E39] dark:bg-[#1C1F26]"
      >
        <div className="flex items-center gap-2.5 border-b border-[#EFECE6] pb-4 dark:border-[#262A34]">
          <History
            className="h-5 w-5 text-[#3B5B8C] dark:text-[#8FB0E3]"
            aria-hidden="true"
          />
          <h2
            id="quiz-history-heading"
            className="font-display text-xl font-semibold text-[#1F2937] dark:text-[#F3F0EA]"
          >
            Histórico de Tentativas
          </h2>
        </div>

        {quizAttempts.length === 0 ? (
          <p className="mt-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Você ainda não finalizou nenhum quiz. Conclua o quiz acima para
            registrar sua primeira pontuação.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-[#EFECE6] dark:divide-[#262A34]">
            {quizAttempts.slice(0, 10).map((att) => {
              const formattedDate = new Date(att.completedAt).toLocaleString(
                'pt-BR',
                {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              );
              return (
                <div
                  key={att.id}
                  className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1F2937] dark:text-[#F3F0EA]">
                      {att.moduleTitle}
                    </p>
                    <p className="text-xs font-mono tabular-nums text-[#6B7280] dark:text-[#9CA3AF]">
                      {formattedDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-mono tabular-nums text-[#4A505B] dark:text-[#B8BEC9]">
                      {att.score}/{att.totalQuestions} acertos
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-mono tabular-nums font-semibold ${
                        att.passed
                          ? 'text-[#3E7A5B] dark:text-[#66B88C]'
                          : 'text-[#B84A4A] dark:text-[#E08A8A]'
                      }`}
                    >
                      {att.passed ? (
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                      )}
                      {att.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

interface QuestionRendererProps {
  question: QuizQuestion;
  submitted: boolean;
  onEvaluate: (isCorrect: boolean) => void;
}

function QuestionRenderer({
  question,
  submitted,
  onEvaluate,
}: QuestionRendererProps) {
  if (question.type === 'multiple_choice') {
    return (
      <MultipleChoiceBlock
        question={question}
        submitted={submitted}
        onEvaluate={onEvaluate}
      />
    );
  }
  if (question.type === 'matching') {
    return (
      <MatchingBlock
        question={question}
        submitted={submitted}
        onEvaluate={onEvaluate}
      />
    );
  }
  return (
    <TranslationBlock
      question={question}
      submitted={submitted}
      onEvaluate={onEvaluate}
    />
  );
}

function MultipleChoiceBlock({
  question,
  submitted,
  onEvaluate,
}: {
  question: MultipleChoiceQuestion;
  submitted: boolean;
  onEvaluate: (isCorrect: boolean) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelectedIndex(idx);
    onEvaluate(idx === question.correctIndex);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-xs font-medium text-[#5A606B] dark:text-[#9CA3AF]">
          Múltipla escolha
        </span>
        <h3 className="text-lg font-semibold leading-snug text-[#1F2937] dark:text-[#F3F0EA]">
          {question.prompt}
        </h3>
        {question.cyrillicHint && (
          <p className="font-display text-3xl font-semibold text-[#3B5B8C] dark:text-[#8FB0E3]">
            {question.cyrillicHint}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {question.options.map((opt, idx) => {
          const isChosen = selectedIndex === idx;
          const isRight = idx === question.correctIndex;

          let cardClass =
            'border-[#E2DDD3] bg-[#FAF8F5] text-[#22252A] hover:border-[#3B5B8C] hover:bg-[#3B5B8C]/5 dark:border-[#2C313D] dark:bg-[#222630] dark:text-[#EDEAE4] dark:hover:border-[#7FA2D6]';

          if (submitted) {
            if (isRight) {
              cardClass =
                'border-[#3E7A5B] bg-[#3E7A5B]/10 text-[#1F2937] dark:border-[#5BA880] dark:bg-[#5BA880]/15 dark:text-[#F3F0EA]';
            } else if (isChosen && !isRight) {
              cardClass =
                'border-[#B84A4A] bg-[#B84A4A]/10 text-[#1F2937] dark:border-[#D97373] dark:bg-[#D97373]/15 dark:text-[#F3F0EA]';
            } else {
              cardClass =
                'border-[#EAE6DD] bg-[#F7F5F0] text-[#747A86] dark:border-[#252932] dark:bg-[#191C22] dark:text-[#787F8D]';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={submitted}
              onClick={() => handleSelect(idx)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-all duration-150 ${
                !submitted ? 'cursor-pointer active:scale-[0.995]' : 'cursor-default'
              } ${cardClass}`}
            >
              <span className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-current/20 font-mono text-xs">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </span>
              {submitted && isRight && (
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-[#3E7A5B] dark:text-[#66B88C]"
                  aria-hidden="true"
                />
              )}
              {submitted && isChosen && !isRight && (
                <XCircle
                  className="h-4 w-4 shrink-0 text-[#B84A4A] dark:text-[#E08A8A]"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MatchingBlock({
  question,
  submitted,
  onEvaluate,
}: {
  question: MatchingQuestion;
  submitted: boolean;
  onEvaluate: (isCorrect: boolean) => void;
}) {
  const rightOptions = useMemo(
    () =>
      deterministicShuffle(
        question.pairs.map((p) => ({ id: p.id, label: p.right })),
        question.id
      ),
    [question.id, question.pairs]
  );

  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [errorPairMessage, setErrorPairMessage] = useState<string | null>(null);

  const handleLeftClick = (pairId: string) => {
    if (submitted || matchedIds.includes(pairId)) return;
    setSelectedLeftId(pairId);
    setErrorPairMessage(null);
  };

  const handleRightClick = (rightPairId: string) => {
    if (submitted || !selectedLeftId || matchedIds.includes(rightPairId)) return;

    if (selectedLeftId === rightPairId) {
      const nextMatched = [...matchedIds, rightPairId];
      setMatchedIds(nextMatched);
      setSelectedLeftId(null);
      setErrorPairMessage(null);

      if (nextMatched.length === question.pairs.length) {
        onEvaluate(mistakeCount === 0);
      }
    } else {
      setMistakeCount((m) => m + 1);
      setErrorPairMessage(
        'Combinação incorreta. Tente associar o termo selecionado a outra opção à direita.'
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#5A606B] dark:text-[#9CA3AF]">
            Associação de palavras
          </span>
          <span className="font-mono tabular-nums text-xs text-[#5A606B] dark:text-[#9CA3AF]">
            {matchedIds.length}/{question.pairs.length} pares · Erros: {mistakeCount}
          </span>
        </div>
        <h3 className="text-lg font-semibold leading-snug text-[#1F2937] dark:text-[#F3F0EA]">
          {question.prompt}
        </h3>
        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          Selecione um item na coluna da esquerda e depois clique no equivalente à
          direita.
        </p>
      </div>

      {errorPairMessage && (
        <p
          role="alert"
          className="rounded-xl border border-[#B84A4A]/35 bg-[#B84A4A]/8 px-3.5 py-2 text-xs font-medium text-[#8F3535] dark:border-[#D97373]/40 dark:bg-[#D97373]/15 dark:text-[#EDA1A1]"
        >
          {errorPairMessage}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Coluna esquerda */}
        <div className="space-y-2.5">
          {question.pairs.map((pair) => {
            const isMatched = matchedIds.includes(pair.id);
            const isSelected = selectedLeftId === pair.id;
            return (
              <button
                key={pair.id}
                type="button"
                disabled={isMatched || submitted}
                onClick={() => handleLeftClick(pair.id)}
                aria-pressed={isSelected}
                className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                  isMatched
                    ? 'border-[#3E7A5B]/50 bg-[#3E7A5B]/10 text-[#2E5E45] dark:border-[#5BA880]/50 dark:bg-[#5BA880]/15 dark:text-[#7FD1A6]'
                    : isSelected
                      ? 'border-[#3B5B8C] bg-[#3B5B8C]/10 text-[#1F2937] dark:border-[#7FA2D6] dark:bg-[#7FA2D6]/20 dark:text-[#F3F0EA]'
                      : 'border-[#E2DDD3] bg-[#FAF8F5] text-[#22252A] hover:border-[#3B5B8C]/60 dark:border-[#2C313D] dark:bg-[#222630] dark:text-[#EDEAE4] cursor-pointer'
                }`}
              >
                <div>
                  <span className="text-base font-semibold">{pair.left}</span>
                  {pair.leftSub && (
                    <span className="ml-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      ({pair.leftSub})
                    </span>
                  )}
                </div>
                {isMatched && (
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {/* Coluna direita */}
        <div className="space-y-2.5">
          {rightOptions.map((opt) => {
            const isMatched = matchedIds.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isMatched || submitted || !selectedLeftId}
                onClick={() => handleRightClick(opt.id)}
                className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium transition-all ${
                  isMatched
                    ? 'border-[#3E7A5B]/50 bg-[#3E7A5B]/10 text-[#2E5E45] dark:border-[#5BA880]/50 dark:bg-[#5BA880]/15 dark:text-[#7FD1A6]'
                    : selectedLeftId
                      ? 'border-[#3B5B8C]/40 bg-white text-[#22252A] hover:border-[#3B5B8C] hover:bg-[#3B5B8C]/5 dark:border-[#3A4356] dark:bg-[#1E222B] dark:text-[#EDEAE4] cursor-pointer'
                      : 'border-[#E6E1D8] bg-[#F7F5F0] text-[#5A606B] dark:border-[#262A34] dark:bg-[#191C22] dark:text-[#8E95A2]'
                }`}
              >
                <span>{opt.label}</span>
                {isMatched && (
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const SERBIAN_DIACRITICS = ['č', 'ć', 'đ', 'š', 'ž'];

function TranslationBlock({
  question,
  submitted,
  onEvaluate,
}: {
  question: TranslationQuestion;
  submitted: boolean;
  onEvaluate: (isCorrect: boolean) => void;
}) {
  const [value, setValue] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted || !value.trim()) return;
    const normalizedUser = normalizeAnswer(value);
    const isCorrect = question.acceptedAnswers.some(
      (ans) => normalizeAnswer(ans) === normalizedUser
    );
    onEvaluate(isCorrect);
  };

  const insertChar = (ch: string) => {
    if (submitted) return;
    setValue((prev) => prev + ch);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <span className="text-xs font-medium text-[#5A606B] dark:text-[#9CA3AF]">
          Tradução e escrita
        </span>
        <h3 className="text-lg font-semibold leading-snug text-[#1F2937] dark:text-[#F3F0EA]">
          {question.prompt}
        </h3>
        <div className="rounded-xl bg-[#F6F3ED] p-4 dark:bg-[#232732]">
          <p className="font-display text-2xl font-semibold text-[#1F2937] dark:text-[#F3F0EA]">
            {question.sourceText}
          </p>
          {question.sourceSub && (
            <p className="mt-1 text-xs text-[#5A606B] dark:text-[#9CA3AF]">
              {question.sourceSub}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        <label
          htmlFor={`input-${question.id}`}
          className="block text-xs font-medium text-[#4A505B] dark:text-[#B8BEC9]"
        >
          Sua resposta
        </label>
        <input
          id={`input-${question.id}`}
          type="text"
          disabled={submitted}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Digite aqui..."
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-[#D8D2C7] bg-white px-4 text-base text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#3B5B8C] focus:outline-none disabled:bg-[#F5F2EC] dark:border-[#303543] dark:bg-[#181B22] dark:text-[#F3F0EA] dark:disabled:bg-[#1E222B]"
        />

        {question.direction === 'pt-to-sr' && !submitted && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Caracteres sérvios:
            </span>
            {SERBIAN_DIACRITICS.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => insertChar(ch)}
                className="h-8 min-w-[32px] rounded-lg border border-[#DFDAD0] bg-[#FAF8F5] px-2 text-sm font-medium text-[#22252A] hover:border-[#3B5B8C] dark:border-[#2E3340] dark:bg-[#232732] dark:text-[#EDEAE4] cursor-pointer"
              >
                {ch}
              </button>
            ))}
          </div>
        )}
      </div>

      {question.hint && (
        <div>
          <button
            type="button"
            onClick={() => setShowHint((h) => !h)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3B5B8C] hover:underline dark:text-[#8FB0E3] cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{showHint ? 'Ocultar dica' : 'Ver dica'}</span>
          </button>
          {showHint && (
            <p className="mt-1.5 text-xs text-[#525864] dark:text-[#B4BAC5]">
              {question.hint}
            </p>
          )}
        </div>
      )}

      {submitted ? (
        <p className="text-sm text-[#4A505B] dark:text-[#C5C9D3]">
          Resposta esperada:{' '}
          <strong className="font-semibold text-[#1F2937] dark:text-[#F3F0EA]">
            {question.displayAnswer}
          </strong>
        </p>
      ) : (
        <button
          type="submit"
          disabled={!value.trim()}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#3B5B8C] px-5 text-sm font-medium text-white transition-colors hover:bg-[#2E4973] disabled:opacity-50 dark:bg-[#5E82B8] dark:text-[#0F131A] cursor-pointer disabled:cursor-not-allowed"
        >
          Verificar resposta
        </button>
      )}
    </form>
  );
}
