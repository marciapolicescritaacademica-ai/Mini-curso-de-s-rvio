import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  LessonStatus,
  QuizAttempt,
  UserProgressState,
} from '@/src/types/course';
import {
  COURSE_BADGES,
  COURSE_MODULES,
  getLessonsForModule,
  getOrderedLessons,
} from '@/src/utils/courseData';

const STORAGE_KEY = 'dobrodosli_serbian_progress_v1';

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPreviousIsoDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateStreak(studyDates: string[]): number {
  if (studyDates.length === 0) return 0;
  const dateSet = new Set(studyDates);
  const today = getTodayIsoDate();
  const yesterday = getPreviousIsoDate(today);

  // A sequência conta a partir de hoje ou ontem caso ainda não tenha estudado hoje
  let cursor = dateSet.has(today) ? today : dateSet.has(yesterday) ? yesterday : '';
  if (!cursor) return 0;

  let streak = 0;
  while (dateSet.has(cursor)) {
    streak += 1;
    cursor = getPreviousIsoDate(cursor);
  }
  return streak;
}

const DEFAULT_STATE: UserProgressState = {
  completedLessonIds: [],
  lastVisitedLessonId: 'les-1-1',
  quizAttempts: [],
  studyDates: [getTodayIsoDate()],
  freeExploreMode: false,
};

function loadInitialProgress(): UserProgressState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<UserProgressState>;
    return {
      completedLessonIds: Array.isArray(parsed.completedLessonIds)
        ? parsed.completedLessonIds
        : [],
      lastVisitedLessonId:
        typeof parsed.lastVisitedLessonId === 'string'
          ? parsed.lastVisitedLessonId
          : 'les-1-1',
      quizAttempts: Array.isArray(parsed.quizAttempts)
        ? parsed.quizAttempts
        : [],
      studyDates:
        Array.isArray(parsed.studyDates) && parsed.studyDates.length > 0
          ? parsed.studyDates
          : [getTodayIsoDate()],
      freeExploreMode: Boolean(parsed.freeExploreMode),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function useCourseProgress() {
  const [progress, setProgress] = useState<UserProgressState>(loadInitialProgress);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Silencioso caso o armazenamento esteja indisponível
    }
  }, [progress]);

  const orderedLessons = useMemo(() => getOrderedLessons(), []);

  const recordStudyToday = useCallback((dates: string[]): string[] => {
    const today = getTodayIsoDate();
    if (dates.includes(today)) return dates;
    return [...dates, today];
  }, []);

  const visitLesson = useCallback(
    (lessonId: string) => {
      setProgress((prev) => ({
        ...prev,
        lastVisitedLessonId: lessonId,
        studyDates: recordStudyToday(prev.studyDates),
      }));
    },
    [recordStudyToday]
  );

  const toggleLessonCompleted = useCallback(
    (lessonId: string, forceState?: boolean) => {
      setProgress((prev) => {
        const exists = prev.completedLessonIds.includes(lessonId);
        const shouldComplete =
          forceState !== undefined ? forceState : !exists;
        const completedLessonIds = shouldComplete
          ? exists
            ? prev.completedLessonIds
            : [...prev.completedLessonIds, lessonId]
          : prev.completedLessonIds.filter((id) => id !== lessonId);

        return {
          ...prev,
          completedLessonIds,
          lastVisitedLessonId: lessonId,
          studyDates: recordStudyToday(prev.studyDates),
        };
      });
    },
    [recordStudyToday]
  );

  const addQuizAttempt = useCallback(
    (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
      const fullAttempt: QuizAttempt = {
        ...attempt,
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        completedAt: new Date().toISOString(),
      };
      setProgress((prev) => ({
        ...prev,
        quizAttempts: [fullAttempt, ...prev.quizAttempts],
        studyDates: recordStudyToday(prev.studyDates),
      }));
      return fullAttempt;
    },
    [recordStudyToday]
  );

  const toggleFreeExploreMode = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      freeExploreMode: !prev.freeExploreMode,
    }));
  }, []);

  const resetProgress = useCallback(() => {
    const fresh: UserProgressState = {
      completedLessonIds: [],
      lastVisitedLessonId: 'les-1-1',
      quizAttempts: [],
      studyDates: [getTodayIsoDate()],
      freeExploreMode: false,
    };
    setProgress(fresh);
  }, []);

  /**
   * Calcula o status de uma aula:
   * - 'completed': aula marcada como concluída
   * - 'in_progress': aula visitada recentemente (ou primeira aula pendente) e ainda não concluída
   * - 'available': desbloqueada para estudo
   * - 'locked': aguardando conclusão das aulas anteriores (quando freeExploreMode = false)
   */
  const getLessonStatus = useCallback(
    (lessonId: string): LessonStatus => {
      if (progress.completedLessonIds.includes(lessonId)) {
        return 'completed';
      }

      const idx = orderedLessons.findIndex((l) => l.id === lessonId);
      if (idx === -1) return 'locked';

      // As duas primeiras aulas ficam acessíveis desde o início; as seguintes desbloqueiam em sequência
      const prevLesson = idx > 0 ? orderedLessons[idx - 1] : null;
      const isUnlockedBySequence =
        idx <= 1 ||
        (prevLesson !== null &&
          progress.completedLessonIds.includes(prevLesson.id));

      if (!progress.freeExploreMode && !isUnlockedBySequence) {
        return 'locked';
      }

      if (progress.lastVisitedLessonId === lessonId) {
        return 'in_progress';
      }

      return 'available';
    },
    [orderedLessons, progress.completedLessonIds, progress.freeExploreMode, progress.lastVisitedLessonId]
  );

  const getModuleProgress = useCallback(
    (moduleId: string) => {
      const modLessons = getLessonsForModule(moduleId);
      const total = modLessons.length;
      const completed = modLessons.filter((l) =>
        progress.completedLessonIds.includes(l.id)
      ).length;
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
      const bestAttempt = progress.quizAttempts
        .filter((a) => a.moduleId === moduleId)
        .sort((a, b) => b.percentage - a.percentage)[0];
      const anyUnlocked = modLessons.some(
        (l) => getLessonStatus(l.id) !== 'locked'
      );

      return {
        total,
        completed,
        percent,
        bestAttempt: bestAttempt ?? null,
        isUnlocked: anyUnlocked,
      };
    },
    [getLessonStatus, progress.completedLessonIds, progress.quizAttempts]
  );

  const stats = useMemo(() => {
    const totalLessons = orderedLessons.length;
    const completedLessons = orderedLessons.filter((l) =>
      progress.completedLessonIds.includes(l.id)
    ).length;
    const coursePercent =
      totalLessons === 0
        ? 0
        : Math.round((completedLessons / totalLessons) * 100);

    const attempts = progress.quizAttempts;
    const averageQuizScore =
      attempts.length === 0
        ? null
        : Math.round(
            attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length
          );

    const streakDays = calculateStreak(progress.studyDates);

    // Verifica conquistas desbloqueadas
    const mod1Lessons = getLessonsForModule('mod-1');
    const mod1Completed =
      mod1Lessons.length > 0 &&
      mod1Lessons.every((l) => progress.completedLessonIds.includes(l.id));

    const unlockedBadgeIds = new Set<string>();
    if (completedLessons >= 1) unlockedBadgeIds.add('badge-first-lesson');
    if (mod1Completed) unlockedBadgeIds.add('badge-cyrillic-explorer');
    if (attempts.some((a) => a.passed)) unlockedBadgeIds.add('badge-first-quiz');
    if (attempts.some((a) => a.percentage === 100))
      unlockedBadgeIds.add('badge-perfect-score');
    if (streakDays >= 2) unlockedBadgeIds.add('badge-streak-3');
    if (totalLessons > 0 && completedLessons === totalLessons)
      unlockedBadgeIds.add('badge-course-master');

    const badges = COURSE_BADGES.map((b) => ({
      ...b,
      unlocked: unlockedBadgeIds.has(b.id),
    }));

    const nextRecommendedLesson =
      orderedLessons.find((l) => !progress.completedLessonIds.includes(l.id)) ??
      orderedLessons[0];

    const completedModulesCount = COURSE_MODULES.filter((mod) => {
      const modLessons = getLessonsForModule(mod.id);
      return (
        modLessons.length > 0 &&
        modLessons.every((l) => progress.completedLessonIds.includes(l.id))
      );
    }).length;

    return {
      totalLessons,
      completedLessons,
      coursePercent,
      averageQuizScore,
      totalQuizAttempts: attempts.length,
      streakDays,
      badges,
      unlockedBadgesCount: unlockedBadgeIds.size,
      nextRecommendedLesson,
      completedModulesCount,
    };
  }, [orderedLessons, progress.completedLessonIds, progress.quizAttempts, progress.studyDates]);

  return {
    progress,
    stats,
    getLessonStatus,
    getModuleProgress,
    visitLesson,
    toggleLessonCompleted,
    addQuizAttempt,
    toggleFreeExploreMode,
    resetProgress,
  };
}
