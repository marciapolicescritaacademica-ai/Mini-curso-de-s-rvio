/**
 * Utilitário de reprodução de áudio para palavras e frases em sérvio.
 *
 * Prioridade de reprodução:
 * 1. Áudio neural gerado pelo endpoint /api/tts (WAV em cache local + servidor),
 *    decodificado via AudioContext desbloqueado diretamente no clique do usuário.
 * 2. Fallback para Web Speech API: usa voz sr-RS/hr/bs com texto cirílico ou,
 *    caso o sistema não tenha voz eslava instalada, usa a forma latina/fonética
 *    para garantir som audível em vez de falha silenciosa.
 * 3. Fallback final via Web Audio API se o navegador não possuir vozes de síntese.
 */

export interface SpeakOptions {
  text: string;
  latin?: string;
  transliteration?: string;
  rate?: number;
  onStart?: () => void;
  onReady?: () => void;
  onEnd?: () => void;
}

let sharedAudioCtx: AudioContext | null = null;
let activeSourceNode: AudioBufferSourceNode | null = null;
let activeAbortController: AbortController | null = null;
let currentRequestId = 0;

const decodedAudioCache = new Map<string, AudioBuffer>();

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    void sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

function playBuffer(
  ctx: AudioContext,
  buffer: AudioBuffer,
  requestId: number,
  onReady?: () => void,
  onEnd?: () => void
) {
  if (requestId !== currentRequestId) return;

  if (activeSourceNode) {
    try {
      activeSourceNode.stop();
      activeSourceNode.disconnect();
    } catch {
      // Ignora se já tiver parado
    }
    activeSourceNode = null;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  activeSourceNode = source;

  onReady?.();

  source.onended = () => {
    if (activeSourceNode === source) {
      activeSourceNode = null;
    }
    if (requestId === currentRequestId) {
      onEnd?.();
    }
  };

  source.start(0);
}

function playFallbackChime(
  ctx: AudioContext | null,
  requestId: number,
  onEnd?: () => void
) {
  if (!ctx || requestId !== currentRequestId) {
    onEnd?.();
    return;
  }
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.14);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.34);
    osc.onended = () => {
      if (requestId === currentRequestId) onEnd?.();
    };
  } catch {
    window.setTimeout(() => {
      if (requestId === currentRequestId) onEnd?.();
    }, 350);
  }
}

async function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const initial = window.speechSynthesis.getVoices();
  if (initial.length > 0) return initial;

  return new Promise((resolve) => {
    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        resolve(window.speechSynthesis.getVoices());
      }
    };
    const timer = window.setTimeout(finish, 250);
    window.speechSynthesis.addEventListener(
      'voiceschanged',
      () => {
        window.clearTimeout(timer);
        finish();
      },
      { once: true }
    );
  });
}

async function fallbackBrowserSpeech(
  options: SpeakOptions,
  ctx: AudioContext | null,
  requestId: number
) {
  if (requestId !== currentRequestId) return;

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onReady?.();
    playFallbackChime(ctx, requestId, options.onEnd);
    return;
  }

  const voices = await getVoicesAsync();
  if (requestId !== currentRequestId) return;

  if (voices.length === 0) {
    options.onReady?.();
    playFallbackChime(ctx, requestId, options.onEnd);
    return;
  }

  const slavicVoice =
    voices.find((v) => v.lang.toLowerCase() === 'sr-rs') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('sr')) ||
    voices.find((v) => v.lang.toLowerCase().startsWith('hr')) ||
    voices.find((v) => v.lang.toLowerCase().startsWith('bs'));

  // Sem voz sérvia/croata instalada, lê a forma fonética/latina para não silenciar o cirílico
  const spokenText = slavicVoice
    ? options.text
    : options.transliteration || options.latin || options.text;

  const utterance = new SpeechSynthesisUtterance(spokenText);
  if (slavicVoice) {
    utterance.voice = slavicVoice;
    utterance.lang = slavicVoice.lang;
  } else {
    const ptVoice = voices.find((v) => v.lang.toLowerCase().startsWith('pt'));
    if (ptVoice) {
      utterance.voice = ptVoice;
      utterance.lang = ptVoice.lang;
    }
  }
  utterance.rate = options.rate ?? 0.88;

  const startedAt = Date.now();
  let completed = false;
  const finish = (didFailSilently = false) => {
    if (completed || requestId !== currentRequestId) return;
    completed = true;
    if (didFailSilently) {
      playFallbackChime(ctx, requestId, options.onEnd);
    } else {
      options.onEnd?.();
    }
  };

  utterance.onstart = () => {
    if (requestId === currentRequestId) {
      options.onReady?.();
    }
  };

  utterance.onend = () => {
    const elapsed = Date.now() - startedAt;
    // Se terminou quase instantaneamente (<120ms), o motor de fala do navegador ignorou o texto
    finish(elapsed < 120);
  };

  utterance.onerror = () => {
    finish(true);
  };

  options.onReady?.();
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);

  window.setTimeout(() => {
    finish(false);
  }, 5000);
}

export function stopSerbianAudio() {
  currentRequestId += 1;

  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }

  if (activeSourceNode) {
    try {
      activeSourceNode.stop();
      activeSourceNode.disconnect();
    } catch {
      // Ignora erro ao parar nó já finalizado
    }
    activeSourceNode = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export async function speakSerbian(options: SpeakOptions): Promise<void> {
  stopSerbianAudio();
  const requestId = currentRequestId;

  // Desbloqueia AudioContext de forma síncrona dentro do evento de clique
  const ctx = getAudioContext();
  options.onStart?.();

  const cacheKey = `${options.text}::${options.latin || ''}`.toLowerCase();
  const cachedBuffer = decodedAudioCache.get(cacheKey);
  if (cachedBuffer && ctx) {
    playBuffer(ctx, cachedBuffer, requestId, options.onReady, options.onEnd);
    return;
  }

  const controller = new AbortController();
  activeAbortController = controller;

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: options.text,
        latin: options.latin,
      }),
      signal: controller.signal,
    });

    if (!response.ok || !ctx) {
      throw new Error(`TTS HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    if (requestId !== currentRequestId) return;

    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    if (requestId !== currentRequestId) return;

    decodedAudioCache.set(cacheKey, audioBuffer);
    playBuffer(ctx, audioBuffer, requestId, options.onReady, options.onEnd);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return;
    }
    await fallbackBrowserSpeech(options, ctx, requestId);
  } finally {
    if (activeAbortController === controller) {
      activeAbortController = null;
    }
  }
}
