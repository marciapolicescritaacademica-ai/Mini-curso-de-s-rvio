/**
 * Tipos principais do minicurso de língua sérvia.
 * Mantém a estrutura desacoplada para facilitar a edição dos arquivos JSON em /src/data.
 */

export type LessonLevel = 'Iniciante' | 'Básico';

export type LessonStatus = 'completed' | 'in_progress' | 'available' | 'locked';

export interface CourseModule {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  level: LessonLevel;
  estimatedMinutes: number;
  lessonIds: string[];
  quizId: string;
}

export interface PhraseExample {
  id: string;
  cyrillic: string;
  latin: string;
  transliteration: string;
  portuguese: string;
  note?: string;
}

export interface LessonSection {
  heading: string;
  paragraphs: string[];
  tip?: string;
  examples?: PhraseExample[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  summary: string;
  durationMinutes: number;
  level: LessonLevel;
  includesAlphabetBoard?: boolean;
  sections: LessonSection[];
}

export interface AlphabetLetter {
  order: number;
  cyrillicUpper: string;
  cyrillicLower: string;
  latinUpper: string;
  latinLower: string;
  name: string;
  category: 'vogal' | 'familiar' | 'falso_amigo' | 'unica';
  pronunciationPt: string;
  exampleCyrillic: string;
  exampleLatin: string;
  exampleMeaning: string;
}

export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple_choice';
  prompt: string;
  cyrillicHint?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  leftSub?: string;
  right: string;
}

export interface MatchingQuestion {
  id: string;
  type: 'matching';
  prompt: string;
  pairs: MatchingPair[];
  explanation: string;
}

export interface TranslationQuestion {
  id: string;
  type: 'translation';
  prompt: string;
  sourceText: string;
  sourceSub?: string;
  direction: 'pt-to-sr' | 'sr-to-pt';
  acceptedAnswers: string[];
  displayAnswer: string;
  hint?: string;
  explanation: string;
}

export type QuizQuestion =
  | MultipleChoiceQuestion
  | MatchingQuestion
  | TranslationQuestion;

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  passingScorePercent: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  moduleId: string;
  moduleTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  criteriaLabel: string;
  iconName: 'compass' | 'book' | 'sparkles' | 'award' | 'flame' | 'graduation';
}

export interface UserProgressState {
  completedLessonIds: string[];
  lastVisitedLessonId: string | null;
  quizAttempts: QuizAttempt[];
  studyDates: string[]; // Datas no formato YYYY-MM-DD
  freeExploreMode: boolean;
}
