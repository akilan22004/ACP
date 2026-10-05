export function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function startDictation({ onResult, onError, onEnd }) {
  const Recognition = getSpeechRecognition();
  if (!Recognition) {
    onError?.('Voice input is not supported in this browser. Use Chrome or Edge, or type your answer.');
    return null;
  }

  const recognition = new Recognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || '')
      .join(' ')
      .trim();
    if (transcript) onResult?.(transcript);
  };

  recognition.onerror = (event) => {
    if (event.error === 'not-allowed') {
      onError?.('Microphone permission was denied. Type your answer instead.');
    } else if (event.error !== 'aborted') {
      onError?.('Could not capture voice. Please type your answer.');
    }
  };

  recognition.onend = () => onEnd?.();
  recognition.start();
  return recognition;
}
