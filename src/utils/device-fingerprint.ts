/**
 * Utilitário de Fingerprint de Dispositivo (Padrão Gold Standard Zero-Trust)
 * 
 * Coleta atributos determinísticos e de alta entropia do navegador:
 * 1. Canvas 2D (geometria complexa, gradientes, renderização de texto e emojis dependentes de GPU/driver)
 * 2. WebGL (identificador do renderizador gráfico)
 * 3. Métricas de tela (resolução, profundidade de cores, pixel ratio)
 * 4. Locale e fuso horário
 * 5. Capacidades de hardware (núcleos de CPU, memória RAM aproximada, suporte a toque)
 * 
 * Gera um hash SHA-256 de 64 caracteres.
 * Seguro contra SSR (retorna null se executado no servidor Next.js).
 */

let cachedFingerprint: string | null = null;

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas-2d';

    // Fundo com gradiente linear
    const grad = ctx.createLinearGradient(0, 0, 200, 0);
    grad.addColorStop(0, '#6B39A7');
    grad.addColorStop(0.5, '#4A2675');
    grad.addColorStop(1, '#10B981');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 200, 50);

    // Texto com kerning específico de SO e fontes de sistema
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('DoeCerto 🔒 Security 2026', 10, 10);

    // Geometria e composição de curvas
    ctx.strokeStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(160, 25, 15, 0, Math.PI * 2, true);
    ctx.stroke();

    return canvas.toDataURL();
  } catch {
    return 'canvas-error';
  }
}

function getWebGLRenderer(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return 'no-webgl';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'webgl-masked';
    }
    return gl.getParameter(gl.RENDERER) || 'webgl-generic';
  } catch {
    return 'webgl-error';
  }
}

async function sha256Hex(message: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      hash = (hash << 5) - hash + message.charCodeAt(i);
      hash |= 0;
    }
    return `fallback_${Math.abs(hash).toString(16)}`;
  }

  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getClientDeviceFingerprint(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (cachedFingerprint) {
    return cachedFingerprint;
  }

  try {
    const canvasHash = getCanvasFingerprint();
    const webglRenderer = getWebGLRenderer();
    const screenMetrics = `${window.screen?.width || 0}x${window.screen?.height || 0}x${window.screen?.colorDepth || 0}@${window.devicePixelRatio || 1}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown-tz';
    const language = navigator.language || (navigator.languages && navigator.languages[0]) || 'unknown-lang';
    const hardwareConcurrency = navigator.hardwareConcurrency || 'unknown-cores';
    const deviceMemory = (navigator as any).deviceMemory || 'unknown-mem';
    const maxTouchPoints = navigator.maxTouchPoints || 0;

    const entropyComponents = [
      canvasHash,
      webglRenderer,
      screenMetrics,
      timezone,
      language,
      `cores:${hardwareConcurrency}`,
      `mem:${deviceMemory}`,
      `touch:${maxTouchPoints}`,
    ].join('###');

    cachedFingerprint = await sha256Hex(entropyComponents);
    return cachedFingerprint;
  } catch (err) {
    console.warn('[DeviceFingerprint] Falha ao coletar fingerprint do dispositivo:', err);
    return null;
  }
}
