import { useMemo, useState } from 'react';
import { SERBIAN_ALPHABET } from '@/src/utils/courseData';
import type { AlphabetLetter } from '@/src/types/course';
import { AudioButton } from '@/src/components/AudioButton';
import { speakSerbian } from '@/src/utils/speech';

type CategoryFilter = 'all' | AlphabetLetter['category'];

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'Todas (30)' },
  { id: 'vogal', label: 'Vogais (5)' },
  { id: 'familiar', label: 'Amigas (11)' },
  { id: 'falso_amigo', label: 'Falsos amigos (5)' },
  { id: 'unica', label: 'Sons próprios (9)' },
];

const CATEGORY_LABELS: Record<AlphabetLetter['category'], string> = {
  vogal: 'Vogal pura',
  familiar: 'Aparência e som familiares',
  falso_amigo: 'Falso amigo visual',
  unica: 'Letra própria do sérvio',
};

interface AlphabetBoardProps {
  compact?: boolean;
}

export function AlphabetBoard({ compact = false }: AlphabetBoardProps) {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<number>(1);

  const filteredLetters = useMemo(() => {
    if (filter === 'all') return SERBIAN_ALPHABET;
    return SERBIAN_ALPHABET.filter((item) => item.category === filter);
  }, [filter]);

  const selectedLetter = useMemo(() => {
    return (
      SERBIAN_ALPHABET.find((l) => l.order === selectedOrder) ??
      SERBIAN_ALPHABET[0]
    );
  }, [selectedOrder]);

  const handleSelectLetter = (letter: AlphabetLetter) => {
    setSelectedOrder(letter.order);
    void speakSerbian({
      text: letter.exampleCyrillic,
      latin: letter.exampleLatin,
    });
  };

  return (
    <section aria-labelledby="azbuka-heading" className="space-y-6">
      {!compact && (
        <div className="space-y-2">
          <h1
            id="azbuka-heading"
            className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F2937] dark:text-[#F3F0EA] text-balance"
          >
            Alfabeto Cirílico Sérvio (Азбука)
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[#525864] dark:text-[#B4BAC5]">
            Cada uma das 30 letras da Azbuka corresponde exatamente a um som e a
            uma letra do alfabeto latino sérvio. Clique em qualquer letra para
            ouvir um exemplo real e ver o guia de pronúncia.
          </p>
        </div>
      )}

      {compact && (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3
            id="azbuka-heading"
            className="font-display text-xl font-semibold text-[#1F2937] dark:text-[#F3F0EA]"
          >
            Painel Interativo da Azbuka (30 letras)
          </h3>
          <span className="text-xs text-[#5A606B] dark:text-[#9CA3AF]">
            Clique em uma letra para ouvir e inspecionar
          </span>
        </div>
      )}

      {/* Filtros interativos */}
      <div
        role="tablist"
        aria-label="Filtrar letras por categoria"
        className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#EFECE6] p-1.5 dark:bg-[#1E222B] w-fit"
      >
        {CATEGORY_TABS.map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.id)}
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

      {/* Layout em duas zonas: grade à esquerda, detalhe à direita */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-6">
            {filteredLetters.map((letter) => {
              const isSelected = letter.order === selectedLetter.order;
              const isFalseFriend = letter.category === 'falso_amigo';
              return (
                <button
                  key={letter.order}
                  type="button"
                  onClick={() => handleSelectLetter(letter)}
                  aria-pressed={isSelected}
                  aria-label={`Letra ${letter.cyrillicUpper}, equivalente latino ${letter.latinUpper}, exemplo ${letter.exampleLatin}`}
                  className={`group flex flex-col items-center justify-between rounded-xl border p-3 text-center transition-all duration-150 active:scale-[0.98] cursor-pointer min-h-[88px] ${
                    isSelected
                      ? 'border-[#3B5B8C] bg-[#3B5B8C]/8 dark:border-[#7FA2D6] dark:bg-[#7FA2D6]/15'
                      : 'border-[#E6E1D8] bg-white hover:border-[#3B5B8C]/40 dark:border-[#2A2E39] dark:bg-[#1C1F26] dark:hover:border-[#7FA2D6]/40'
                  }`}
                >
                  <div className="flex w-full items-center justify-between text-[11px] font-mono tabular-nums text-[#747A86] dark:text-[#8E95A2]">
                    <span>{String(letter.order).padStart(2, '0')}</span>
                    {isFalseFriend && (
                      <span
                        className="font-sans font-medium text-[#B84A4A] dark:text-[#E08A8A]"
                        title="Falso amigo visual"
                      >
                        !
                      </span>
                    )}
                  </div>
                  <div className="my-1 text-2xl font-semibold tracking-tight text-[#1F2937] dark:text-[#F3F0EA]">
                    {letter.cyrillicUpper} {letter.cyrillicLower}
                  </div>
                  <div className="text-xs font-medium text-[#3B5B8C] dark:text-[#8FB0E3]">
                    {letter.latinUpper} {letter.latinLower}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cartão de inspeção da letra selecionada */}
        <aside
          aria-live="polite"
          className="lg:col-span-4 rounded-2xl border border-[#E6E1D8] bg-white p-6 dark:border-[#2A2E39] dark:bg-[#1C1F26] lg:sticky lg:top-24"
        >
          <div className="flex items-start justify-between gap-4 border-b border-[#EFECE6] pb-4 dark:border-[#262A34]">
            <div>
              <p className="text-xs font-medium text-[#5A606B] dark:text-[#9CA3AF]">
                Letra {selectedLetter.order} de 30 · {CATEGORY_LABELS[selectedLetter.category]}
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-5xl font-semibold text-[#1F2937] dark:text-[#F3F0EA]">
                  {selectedLetter.cyrillicUpper}
                  {selectedLetter.cyrillicLower}
                </span>
                <span className="text-xl font-medium text-[#3B5B8C] dark:text-[#8FB0E3]">
                  → {selectedLetter.latinUpper}
                  {selectedLetter.latinLower}
                </span>
              </div>
            </div>
            <AudioButton
              text={selectedLetter.exampleCyrillic}
              latin={selectedLetter.exampleLatin}
              label={`Ouvir exemplo ${selectedLetter.exampleLatin}`}
            />
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                Como pronunciar
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-[#22252A] dark:text-[#E5E2DC]">
                {selectedLetter.pronunciationPt}
              </p>
            </div>

            <div className="rounded-xl bg-[#F6F3ED] p-4 dark:bg-[#232732]">
              <div className="text-xs font-medium text-[#5A606B] dark:text-[#9CA3AF]">
                Palavra de exemplo
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className="text-xl font-semibold text-[#1F2937] dark:text-[#F3F0EA]">
                  {selectedLetter.exampleCyrillic}
                </span>
                <span className="text-sm font-medium text-[#3B5B8C] dark:text-[#8FB0E3]">
                  {selectedLetter.exampleLatin}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#4A505B] dark:text-[#B8BEC9]">
                Significado: {selectedLetter.exampleMeaning}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
