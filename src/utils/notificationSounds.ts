// Play tone using Web Audio API directly
const playTone = (frequency: number, duration: number, volume: number = 0.3) => {
 try {
 const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

 const oscillator = audioContext.createOscillator();
 const gainNode = audioContext.createGain();

 oscillator.connect(gainNode);
 gainNode.connect(audioContext.destination);

 oscillator.frequency.value = frequency;
 oscillator.type = 'sine';

 // Set initial volume
 gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
 // Fade out at the end
 gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

 oscillator.start(audioContext.currentTime);
 oscillator.stop(audioContext.currentTime + duration);

 return new Promise<void>((resolve) => {
 oscillator.onended = () => {
 audioContext.close();
 resolve();
 };
 });
 } catch (err) {
 console.error('Error playing tone:', err);
 return Promise.reject(err);
 }
};

const playSiren = async (duration: number, volume: number) => {
 const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
 const oscillator = audioContext.createOscillator();
 const gainNode = audioContext.createGain();

 oscillator.connect(gainNode);
 gainNode.connect(audioContext.destination);
 oscillator.type = 'square';
 gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

 const startFreq = 800;
 const endFreq = 400;
 oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);

 for (let i = 0; i < duration * 4; i++) {
 const time = audioContext.currentTime + (i * 0.25);
 const freq = i % 2 === 0 ? startFreq : endFreq;
 oscillator.frequency.setValueAtTime(freq, time);
 }

 oscillator.start(audioContext.currentTime);
 oscillator.stop(audioContext.currentTime + duration);

 return new Promise<void>((resolve) => {
 oscillator.onended = () => {
 audioContext.close();
 resolve();
 };
 });
};

const speakText = async (text: string, lang: string = 'ar', volume: number = 1.0, rate: number = 0.9, pitch: number = 1.0) => {
 if ('speechSynthesis' in window) {
 return new Promise<void>((resolve) => {
 window.speechSynthesis.cancel();

 const utterance = new SpeechSynthesisUtterance(text);

 const langCode = lang === 'ar' ? 'ar-SA' : 'nb-NO';
 utterance.lang = langCode;
 utterance.rate = rate || 0.9;
 utterance.pitch = pitch || 1.0;
 utterance.volume = volume;

 const voices = window.speechSynthesis.getVoices();
 console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));

 const preferredVoice = voices.find(v =>
 v.lang.startsWith(lang === 'ar' ? 'ar' : 'no') ||
 v.lang.startsWith(lang === 'ar' ? 'ar' : 'nb')
 );

 if (preferredVoice) {
 utterance.voice = preferredVoice;
 console.log('Selected voice:', preferredVoice.name, preferredVoice.lang);
 } else {
 console.warn('No preferred voice found, using default');
 }

 utterance.onend = () => {
 console.log('✅ Speech completed');
 resolve();
 };

 utterance.onerror = (error) => {
 console.error('❌ Speech error:', error);
 resolve();
 };

 setTimeout(() => {
 console.log('🗣️ Speaking:', text);
 window.speechSynthesis.speak(utterance);
 }, 100);
 });
 } else {
 console.warn('❌ Speech Synthesis not supported');
 return Promise.resolve();
 }
};

export const NOTIFICATION_SOUNDS = {
 bell: {
 name: ' / Bjelle',
 frequency: 800,
 duration: 0.5,
 description: ' ',
 type: 'tone' as const
 },
 chime: {
 name: ' / Chime',
 frequency: 1200,
 duration: 0.4,
 description: ' ',
 type: 'tone' as const
 },
 alert: {
 name: ' / Varsel',
 frequency: 1000,
 duration: 0.3,
 description: ' ',
 type: 'tone' as const
 },
 alarm: {
 name: ' / Alarm',
 frequency: 1500,
 duration: 0.6,
 description: ' ',
 type: 'tone' as const
 },
 gentle: {
 name: ' / Mild',
 frequency: 600,
 duration: 0.7,
 description: ' ',
 type: 'tone' as const
 },
 siren: {
 name: '🚨 / Sirene',
 frequency: 800,
 duration: 1.5,
 description: ' ',
 type: 'siren' as const
 },
 urgent: {
 name: '🔴 / Haster',
 frequency: 2000,
 duration: 1.2,
 description: ' ',
 type: 'tone' as const
 },
 loud_beep: {
 name: '⚡ / Høyt pip',
 frequency: 2500,
 duration: 1.0,
 description: 'Sharp and strong whistle',
 type: 'tone' as const
 },
 voice_ar: {
 name: '🗣️ Arabic voice',
 frequency: 0,
 duration: 3,
 description: ' Arabic',
 type: 'voice' as const,
 text: '! ',
 customizable: true
 },
 voice_no: {
 name: '🗣️ Menneskelig stemme norsk',
 frequency: 0,
 duration: 3,
 description: 'Menneskelig stemme leser varselet på norsk',
 type: 'voice' as const,
 text: 'Advarsel! Vennligst fullfør de daglige rutineoppgavene',
 customizable: true
 }
};

export const playSound = async (
 soundType: keyof typeof NOTIFICATION_SOUNDS,
 volume: number,
 repeatCount: number,
 intervalSeconds: number,
 onComplete?: () => void,
 customText?: string,
 voiceRate?: number,
 voicePitch?: number
) => {
 console.log('🔊 playSound called with:', { soundType, volume, repeatCount, intervalSeconds, customText, voiceRate, voicePitch });

 const sound = NOTIFICATION_SOUNDS[soundType];
 if (!sound) {
 console.error('❌ Sound type not found:', soundType);
 console.log('Available sounds:', Object.keys(NOTIFICATION_SOUNDS));
 if (onComplete) onComplete();
 return;
 }

 const calculatedVolume = Math.min(Math.max(volume / 100, 0), 1);
 console.log('🎚️ Volume calculated:', calculatedVolume);

 const playOnce = async () => {
 try {
 if (sound.type === 'siren') {
 console.log('🚨 Playing siren for', sound.duration + 's');
 await playSiren(sound.duration, calculatedVolume);
 } else if (sound.type === 'voice') {
 const textToSpeak = customText || sound.text || '';
 console.log('🗣️ Speaking text:', textToSpeak);
 await speakText(
 textToSpeak,
 soundType.includes('ar') ? 'ar' : 'no',
 calculatedVolume,
 voiceRate,
 voicePitch
 );
 } else {
 console.log('🎵 Playing tone:', sound.frequency + 'Hz for', sound.duration + 's');
 await playTone(sound.frequency, sound.duration, calculatedVolume);
 }
 console.log('✅ Sound played successfully:', soundType);
 } catch (err) {
 console.error('❌ Error playing tone:', err);
 throw err;
 }
 };

 const playAll = async () => {
 for (let i = 0; i < repeatCount; i++) {
 console.log(`🔁 Repetition ${i + 1}/${repeatCount}`);
 try {
 await playOnce();
 if (i < repeatCount1) {
 console.log(`⏳ Waiting ${intervalSeconds}s before next repetition...`);
 await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
 }
 } catch (err) {
 console.error('❌ Failed to play sound:', err);
 break;
 }
 }
 console.log('🎉 All repetitions completed');
 if (onComplete) onComplete();
 };

 playAll().catch(err => {
 console.error('❌ Error in playSound:', err);
 if (onComplete) onComplete();
 });
};
