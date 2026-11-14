import alphabetData from '@/src/data/alphabet.json';
import badgesData from '@/src/data/badges.json';
import lessonsData from '@/src/data/lessons.json';
import modulesData from '@/src/data/modules.json';
import quizzesData from '@/src/data/quizzes.json';
import type {
  AlphabetLetter,
  BadgeDefinition,
  CourseModule,
  Lesson,
  Quiz,
} from '@/src/types/course';

export const COURSE_MODULES: CourseModule[] = modulesData as CourseModule[];
export const COURSE_LESSONS: Lesson[] = lessonsData as Lesson[];
export const COURSE_QUIZZES: Quiz[] = quizzesData as Quiz[];
export const SERBIAN_ALPHABET: AlphabetLetter[] =
  alphabetData as AlphabetLetter[];
export const COURSE_BADGES: BadgeDefinition[] =
  badgesData as BadgeDefinition[];

/**
 * Retorna a lista linear ordenada de todas as aulas do curso.
 */
export function getOrderedLessons(): Lesson[] {
  const ordered: Lesson[] = [];
  for (const mod of [...COURSE_MODULES].sort((a, b) => a.order - b.order)) {
    const modLessons = COURSE_LESSONS.filter((l) => l.moduleId === mod.id).sort(
      (a, b) => a.order - b.order
    );
    ordered.push(...modLessons);
  }
  return ordered;
}

export function getModuleById(moduleId: string): CourseModule | undefined {
  return COURSE_MODULES.find((m) => m.id === moduleId);
}

export function getLessonById(lessonId: string): Lesson | undefined {
  return COURSE_LESSONS.find((l) => l.id === lessonId);
}

export function getLessonsForModule(moduleId: string): Lesson[] {
  return COURSE_LESSONS.filter((l) => l.moduleId === moduleId).sort(
    (a, b) => a.order - b.order
  );
}

export function getQuizForModule(moduleId: string): Quiz | undefined {
  return COURSE_QUIZZES.find((q) => q.moduleId === moduleId);
}
