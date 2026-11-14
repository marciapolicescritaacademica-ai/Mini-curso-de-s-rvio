import { useState } from 'react';
import { MotionConfig } from 'motion/react';
import { useTheme } from '@/src/hooks/useTheme';
import { useCourseProgress } from '@/src/hooks/useCourseProgress';
import { Header, type AppView } from '@/src/components/Header';
import { CourseOverview } from '@/src/components/CourseOverview';
import { LessonView } from '@/src/components/LessonView';
import { AlphabetBoard } from '@/src/components/AlphabetBoard';
import { QuizView } from '@/src/components/QuizView';
import { DashboardView } from '@/src/components/DashboardView';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    progress,
    stats,
    getLessonStatus,
    getModuleProgress,
    visitLesson,
    toggleLessonCompleted,
    addQuizAttempt,
    toggleFreeExploreMode,
    resetProgress,
  } = useCourseProgress();

  const [activeView, setActiveView] = useState<AppView>('course');
  const [activeLessonId, setActiveLessonId] = useState<string>(
    progress.lastVisitedLessonId || 'les-1-1'
  );
  const [activeQuizModuleId, setActiveQuizModuleId] = useState<string | null>(
    'mod-1'
  );

  const openLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    visitLesson(lessonId);
    setActiveView('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openQuiz = (moduleId: string) => {
    setActiveQuizModuleId(moduleId);
    setActiveView('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: AppView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueCourse = () => {
    openLesson(stats.nextRecommendedLesson.id);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#22252A] dark:bg-[#14161A] dark:text-[#EDEAE4] transition-colors duration-200">
        <Header
          activeView={activeView}
          onNavigate={handleNavigate}
          onContinueCourse={handleContinueCourse}
          theme={theme}
          onToggleTheme={toggleTheme}
          continueLabel={
            stats.completedLessons === 0 ? 'Começar' : 'Continuar'
          }
        />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {activeView === 'course' && (
            <CourseOverview
              coursePercent={stats.coursePercent}
              completedLessonsCount={stats.completedLessons}
              totalLessonsCount={stats.totalLessons}
              freeExploreMode={progress.freeExploreMode}
              onToggleFreeExplore={toggleFreeExploreMode}
              getLessonStatus={getLessonStatus}
              getModuleProgress={getModuleProgress}
              onOpenLesson={openLesson}
              onOpenQuiz={openQuiz}
              nextRecommendedLesson={stats.nextRecommendedLesson}
            />
          )}

          {activeView === 'lesson' && (
            <LessonView
              lessonId={activeLessonId}
              isCompleted={progress.completedLessonIds.includes(activeLessonId)}
              getLessonStatus={getLessonStatus}
              onToggleComplete={(id) => toggleLessonCompleted(id)}
              onSelectLesson={openLesson}
              onBackToCourse={() => handleNavigate('course')}
              onStartModuleQuiz={openQuiz}
            />
          )}

          {activeView === 'alphabet' && <AlphabetBoard />}

          {activeView === 'quiz' && (
            <QuizView
              selectedModuleId={activeQuizModuleId}
              quizAttempts={progress.quizAttempts}
              isModuleUnlocked={(modId) => getModuleProgress(modId).isUnlocked}
              onSelectModule={(modId) => setActiveQuizModuleId(modId)}
              onRecordAttempt={addQuizAttempt}
              onBackToCourse={() => handleNavigate('course')}
            />
          )}

          {activeView === 'dashboard' && (
            <DashboardView
              stats={stats}
              quizAttempts={progress.quizAttempts}
              getModuleProgress={getModuleProgress}
              onOpenLesson={openLesson}
              onOpenQuiz={openQuiz}
              onResetProgress={resetProgress}
            />
          )}
        </main>

        <footer className="border-t border-[#E7E2D9] py-6 text-center text-xs text-[#6B7280] dark:border-[#262A34] dark:text-[#8E95A2]">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
            <span>Dobrodošli — Minicurso de Língua Sérvia</span>
            <span>Progresso salvo automaticamente neste navegador</span>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}

export default App;
