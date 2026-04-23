import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaMicrophone,
  FaStop,
  FaUser,
  FaUserMd,
  FaTrash,
  FaDownload,
  FaBrain,
  FaBalanceScale,
  FaExclamationTriangle,
} from 'react-icons/fa';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const CLIENT_STRESS_MARKERS = ['тривог', 'страх', 'панік', 'напруж', 'безсил', 'втом', 'не можу', 'погано'];
const CLIENT_DEPRESSIVE_MARKERS = ['депрес', 'апат', 'порожнеч', 'нічого не хочу', 'безнаді', 'смут'];
const CLIENT_SUPPORT_MARKERS = ['допомог', 'підтрим', 'друг', 'родин', 'психолог', 'поруч'];
const CLIENT_SLEEP_MARKERS = ['сон', 'безсон', 'прокида', 'заснути', 'вночі'];
const ENROLLMENT_TARGET_MS = 12000;
const ENROLLMENT_MIN_SAMPLES = 35;
const VOICE_ENERGY_THRESHOLD = 0.022;

const BIG_FIVE_KEYWORDS = {
  neuroticism: ['тривог', 'панік', 'страх', 'напруж', 'втом', 'безсил', 'невпевн'],
  extraversion: ['люди', 'спілку', 'зустріч', 'активн', 'команда', 'друзі'],
  openness: ['нове', 'ідеї', 'творч', 'змін', 'цікаво', 'дослід'],
  agreeableness: ['підтрим', 'розумі', 'емпат', 'допомог', 'довір', 'співчут'],
  conscientiousness: ['план', 'структур', 'відповід', 'дедлайн', 'ціль', 'контроль'],
};

const MASLOW_KEYWORDS = {
  physiological: ['сон', 'апетит', 'втом', 'тіло', 'біль', 'енергі'],
  safety: ['безпек', 'ризик', 'стабіль', 'загроз', 'страх', 'фінанс'],
  love: ['стосунк', 'близьк', 'родин', 'друзі', 'підтрим', 'самот'],
  esteem: ['самооцін', 'цінність', 'повага', 'успіх', 'провал', 'впевнен'],
  self_actualization: ['сенс', 'розвит', 'покликан', 'самореал', 'ціль', 'майбутн'],
};

const SCHWARTZ_KEYWORDS = {
  power: ['влада', 'вплив', 'контроль', 'статус'],
  achievement: ['досяг', 'успіх', 'результат', 'перемог'],
  hedonism: ['задовол', 'приємн', 'насолод', 'комфорт'],
  security: ['безпек', 'стабіль', 'захист', 'передбач'],
  benevolence: ['допомог', 'турбот', 'підтрим', 'близьк'],
  universalism: ['справедлив', 'людяність', 'суспіль', 'еколог'],
  self_direction: ['самостій', 'автоном', 'власн', 'вибір'],
  stimulation: ['новизн', 'ризик', 'виклик', 'пригод'],
  conformity: ['правил', 'норма', 'обовяз', 'дисциплін'],
  tradition: ['традиц', 'звича', 'цінност', 'родинн'],
};

function nowTimeLabel() {
  return new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function countKeywordHits(text, keywords) {
  const lowered = text.toLowerCase();
  return keywords.reduce((acc, keyword) => acc + (lowered.includes(keyword) ? 1 : 0), 0);
}

function spectralCentroidHz(freqData, sampleRate) {
  let weighted = 0;
  let sum = 0;
  for (let i = 0; i < freqData.length; i += 1) {
    const magnitude = freqData[i];
    weighted += i * magnitude;
    sum += magnitude;
  }
  if (sum === 0) return 0;
  const nyquist = sampleRate / 2;
  return (weighted / sum) * (nyquist / freqData.length);
}

function inferSpeakerByText(text, lastSpeaker) {
  const normalized = text.toLowerCase();
  if (normalized.includes('?')) return { speaker: 'psychologist', confidence: 'середня', reason: 'question' };
  if (normalized.includes('я ') || normalized.includes('мені') || normalized.includes('мене')) {
    return { speaker: 'client', confidence: 'середня', reason: 'first-person' };
  }

  const fallback = lastSpeaker === 'client' ? 'psychologist' : 'client';
  return { speaker: fallback, confidence: 'низька', reason: 'alternation' };
}

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

function sumHitsByMap(text, map) {
  return Object.fromEntries(
    Object.entries(map).map(([key, keywords]) => [key, countKeywordHits(text, keywords)])
  );
}

function buildRealtimeProfile(entries) {
  const clientEntries = entries.filter((entry) => entry.speaker === 'client');
  const text = clientEntries.map((entry) => entry.text).join(' ').toLowerCase();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const b5Hits = sumHitsByMap(text, BIG_FIVE_KEYWORDS);
  const maslowHits = sumHitsByMap(text, MASLOW_KEYWORDS);
  const schwartzHits = sumHitsByMap(text, SCHWARTZ_KEYWORDS);

  const stressLoad = b5Hits.neuroticism;
  const socialLoad = b5Hits.extraversion + b5Hits.agreeableness;
  const planningLoad = b5Hits.conscientiousness;
  const growthLoad = b5Hits.openness;

  const bigFive = {
    neuroticism: clamp(2 + stressLoad * 0.4, 1, 5),
    extraversion: clamp(2 + socialLoad * 0.25 - (stressLoad > 4 ? 0.4 : 0), 1, 5),
    openness: clamp(2 + growthLoad * 0.35, 1, 5),
    agreeableness: clamp(2 + b5Hits.agreeableness * 0.4, 1, 5),
    conscientiousness: clamp(2 + planningLoad * 0.35, 1, 5),
  };

  const maslow = {
    physiological: clamp(2 + maslowHits.physiological * 0.3 - (stressLoad > 4 ? 0.3 : 0), 1, 5),
    safety: clamp(2 + maslowHits.safety * 0.35 - (stressLoad > 3 ? 0.2 : 0), 1, 5),
    love: clamp(2 + maslowHits.love * 0.35, 1, 5),
    esteem: clamp(2 + maslowHits.esteem * 0.35, 1, 5),
    self_actualization: clamp(2 + maslowHits.self_actualization * 0.35, 1, 5),
  };

  const schwartz = Object.fromEntries(
    Object.entries(schwartzHits).map(([key, hits]) => [key, clamp(2 + hits * 0.45, 1, 5)])
  );

  return {
    words,
    profile: {
      big_five: bigFive,
      maslow,
      schwartz,
      analysis_source: 'live-session-rule-based',
    },
  };
}

function buildInsights(entries) {
  const clientEntries = entries.filter((entry) => entry.speaker === 'client');
  const psychologistEntries = entries.filter((entry) => entry.speaker === 'psychologist');

  const clientText = clientEntries.map((entry) => entry.text).join(' ');
  const psychologistText = psychologistEntries.map((entry) => entry.text).join(' ');

  const stressHits = countKeywordHits(clientText, CLIENT_STRESS_MARKERS);
  const depressiveHits = countKeywordHits(clientText, CLIENT_DEPRESSIVE_MARKERS);
  const supportHits = countKeywordHits(clientText, CLIENT_SUPPORT_MARKERS);
  const sleepHits = countKeywordHits(clientText, CLIENT_SLEEP_MARKERS);

  const clientWords = clientText.trim() ? clientText.trim().split(/\s+/).length : 0;
  const psychologistWords = psychologistText.trim() ? psychologistText.trim().split(/\s+/).length : 0;
  const totalWords = Math.max(1, clientWords + psychologistWords);
  const clientShare = Math.round((clientWords / totalWords) * 100);

  const riskLevel = stressHits + depressiveHits >= 6 ? 'Високий' : stressHits + depressiveHits >= 3 ? 'Помірний' : 'Низький';

  const focus = [];
  if (stressHits >= 2) focus.push('Підвищена тривога/напруга');
  if (depressiveHits >= 2) focus.push('Ознаки зниженого настрою');
  if (sleepHits >= 1) focus.push('Скарги, пов’язані зі сном');
  if (supportHits <= 1 && clientEntries.length > 0) focus.push('Низька артикуляція підтримки');
  if (focus.length === 0 && entries.length > 0) focus.push('Суттєвих маркерів дистресу не виявлено');

  const therapistTips = [];
  if (clientShare < 45) therapistTips.push('Збільшити частку відкритих запитань, щоб дати клієнту більше мовного простору.');
  if (stressHits >= 2) therapistTips.push('Уточнити тригери тривоги та короткострокові стратегії саморегуляції.');
  if (depressiveHits >= 2) therapistTips.push('Оцінити динаміку настрою, енергії та мотивації за останні 2 тижні.');
  if (sleepHits >= 1) therapistTips.push('Додати блок про гігієну сну й нічні пробудження.');
  if (therapistTips.length === 0) therapistTips.push('Продовжити структуроване уточнення запиту та ресурсів.');

  return {
    riskLevel,
    clientShare,
    focus,
    therapistTips,
    counters: {
      stressHits,
      depressiveHits,
      supportHits,
      sleepHits,
    },
  };
}

export default function LiveSessionAssistant() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const entriesRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const frequencyDataRef = useRef(null);
  const timeDomainDataRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastCentroidRef = useRef(0);
  const lastVoiceEnergyRef = useRef(0);
  const enrollmentIntervalRef = useRef(null);
  const enrollmentTimeoutRef = useRef(null);
  const utteranceCentroidSamplesRef = useRef([]);
  const enrollmentSamplesRef = useRef([]);
  const enrollmentTicksRef = useRef(0);
  const finalizeEnrollmentRef = useRef(null);
  const shouldKeepListeningRef = useRef(false);
  const desiredSpeakerRef = useRef(null);

  const [entries, setEntries] = useState([]);
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [sessionError, setSessionError] = useState('');
  const [voiceProfiles, setVoiceProfiles] = useState({ client: null, psychologist: null });
  const [enrollingSpeaker, setEnrollingSpeaker] = useState(null);
  const [autoInfo, setAutoInfo] = useState('');
  const [confirmAutoTagMode, setConfirmAutoTagMode] = useState(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);

  const hasClientProfile = Boolean(voiceProfiles.client);
  const hasPsychologistProfile = Boolean(voiceProfiles.psychologist);
  const canRunAutoMode = hasClientProfile && hasPsychologistProfile;

  const role = localStorage.getItem('userRole');

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/auth');
      return;
    }
    if (role !== 'psychologist') {
      navigate('/dashboard');
    }
  }, [navigate, role]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
      if (enrollmentIntervalRef.current) {
        clearInterval(enrollmentIntervalRef.current);
        enrollmentIntervalRef.current = null;
      }
      if (enrollmentTimeoutRef.current) {
        clearTimeout(enrollmentTimeoutRef.current);
        enrollmentTimeoutRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      frequencyDataRef.current = null;
      timeDomainDataRef.current = null;
      lastCentroidRef.current = 0;
      lastVoiceEnergyRef.current = 0;
      enrollmentSamplesRef.current = [];
      enrollmentTicksRef.current = 0;
      finalizeEnrollmentRef.current = null;
      setEnrollmentProgress(0);
    };
  }, []);

  const insights = useMemo(() => buildInsights(entries), [entries]);
  const realtimeProfile = useMemo(() => buildRealtimeProfile(entries), [entries]);

  const bigFiveChart = useMemo(
    () => [
      { name: 'Невротизм', val: realtimeProfile.profile.big_five.neuroticism },
      { name: 'Екстраверсія', val: realtimeProfile.profile.big_five.extraversion },
      { name: 'Відкритість', val: realtimeProfile.profile.big_five.openness },
      { name: 'Доброзичл.', val: realtimeProfile.profile.big_five.agreeableness },
      { name: 'Сумлінність', val: realtimeProfile.profile.big_five.conscientiousness },
    ],
    [realtimeProfile]
  );

  const maslowChart = useMemo(
    () => [
      { name: 'Фізіол.', val: realtimeProfile.profile.maslow.physiological, fill: '#ef4444' },
      { name: 'Безпека', val: realtimeProfile.profile.maslow.safety, fill: '#f97316' },
      { name: 'Любов', val: realtimeProfile.profile.maslow.love, fill: '#eab308' },
      { name: 'Повага', val: realtimeProfile.profile.maslow.esteem, fill: '#22c55e' },
      { name: 'Самоакт.', val: realtimeProfile.profile.maslow.self_actualization, fill: '#3b82f6' },
    ],
    [realtimeProfile]
  );

  const schwartzChart = useMemo(
    () => [
      { name: 'Влада', val: realtimeProfile.profile.schwartz.power },
      { name: 'Досягн.', val: realtimeProfile.profile.schwartz.achievement },
      { name: 'Гедон.', val: realtimeProfile.profile.schwartz.hedonism },
      { name: 'Безпека', val: realtimeProfile.profile.schwartz.security },
      { name: 'Доброта', val: realtimeProfile.profile.schwartz.benevolence },
      { name: 'Універс.', val: realtimeProfile.profile.schwartz.universalism },
      { name: 'Самост.', val: realtimeProfile.profile.schwartz.self_direction },
      { name: 'Стимул.', val: realtimeProfile.profile.schwartz.stimulation },
      { name: 'Конформ.', val: realtimeProfile.profile.schwartz.conformity },
      { name: 'Традиц.', val: realtimeProfile.profile.schwartz.tradition },
    ],
    [realtimeProfile]
  );

  const teardownAudioMonitor = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    frequencyDataRef.current = null;
    timeDomainDataRef.current = null;
    lastCentroidRef.current = 0;
    lastVoiceEnergyRef.current = 0;
  };

  const ensureAudioMonitor = async () => {
    if (analyserRef.current && audioContextRef.current) return true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextImpl = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextImpl();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const freqData = new Uint8Array(analyser.frequencyBinCount);
      const timeData = new Uint8Array(analyser.fftSize);

      audioContextRef.current = context;
      analyserRef.current = analyser;
      frequencyDataRef.current = freqData;
      timeDomainDataRef.current = timeData;
      streamRef.current = stream;

      const tick = () => {
        if (!analyserRef.current || !frequencyDataRef.current || !audioContextRef.current) return;
        analyserRef.current.getByteFrequencyData(frequencyDataRef.current);
        if (timeDomainDataRef.current) {
          analyserRef.current.getByteTimeDomainData(timeDomainDataRef.current);
          let sumSquares = 0;
          for (let i = 0; i < timeDomainDataRef.current.length; i += 1) {
            const sample = (timeDomainDataRef.current[i] - 128) / 128;
            sumSquares += sample * sample;
          }
          lastVoiceEnergyRef.current = Math.sqrt(sumSquares / timeDomainDataRef.current.length);
        }
        lastCentroidRef.current = spectralCentroidHz(frequencyDataRef.current, audioContextRef.current.sampleRate);
        animationFrameRef.current = requestAnimationFrame(tick);
      };

      animationFrameRef.current = requestAnimationFrame(tick);
      return true;
    } catch {
      setSessionError('Не вдалося отримати доступ до мікрофона для авто-розпізнавання спікера.');
      return false;
    }
  };

  const inferSpeakerAuto = (text) => {
    const centroidSamples = utteranceCentroidSamplesRef.current;
    const centroid = centroidSamples.length
      ? centroidSamples.reduce((acc, value) => acc + value, 0) / centroidSamples.length
      : lastCentroidRef.current;

    const normalizeProfile = (profile) => {
      if (!profile) return null;
      if (typeof profile === 'number') {
        return { mean: profile, std: 80 };
      }
      return {
        mean: profile.mean,
        std: Math.max(45, profile.std || 80),
      };
    };

    const clientProfile = normalizeProfile(voiceProfiles.client);
    const psychologistProfile = normalizeProfile(voiceProfiles.psychologist);

    if (!clientProfile || !psychologistProfile) {
      const lastSpeaker = entriesRef.current.length
        ? entriesRef.current[entriesRef.current.length - 1].speaker
        : 'psychologist';
      return { ...inferSpeakerByText(text, lastSpeaker), reason: 'fallback-missing-profiles' };
    }

    if (centroid > 0) {
      const distClient = Math.abs(centroid - clientProfile.mean);
      const distPsychologist = Math.abs(centroid - psychologistProfile.mean);
      const zClient = distClient / Math.max(35, clientProfile.std);
      const zPsychologist = distPsychologist / Math.max(35, psychologistProfile.std);

      const bestSpeaker = zClient <= zPsychologist ? 'client' : 'psychologist';
      const zGap = Math.abs(zClient - zPsychologist);

      const bothTooFar = zClient > 2.1 && zPsychologist > 2.1;
      const tooClose = zGap < 0.32;

      if (bothTooFar || tooClose) {
        const lastSpeaker = entriesRef.current.length
          ? entriesRef.current[entriesRef.current.length - 1].speaker
          : 'psychologist';
        return { ...inferSpeakerByText(text, lastSpeaker), reason: bothTooFar ? 'fallback-outside-profile' : 'fallback-ambiguous-profile' };
      }

      const confidence = zGap > 0.95 ? 'висока' : zGap > 0.55 ? 'середня' : 'низька';
      return { speaker: bestSpeaker, confidence, reason: 'voice-profile' };
    }

    const lastSpeaker = entriesRef.current.length
      ? entriesRef.current[entriesRef.current.length - 1].speaker
      : 'psychologist';
    return inferSpeakerByText(text, lastSpeaker);
  };

  const startEnrollment = async (speaker) => {
    if (isListening) {
      setSessionError('Спочатку зупиніть активне розпізнавання, а потім запускайте навчання голосу.');
      return;
    }

    setSessionError('');
    setEnrollmentProgress(0);
    const ok = await ensureAudioMonitor();
    if (!ok) return;

    setEnrollingSpeaker(speaker);
    enrollmentSamplesRef.current = [];
    enrollmentTicksRef.current = 0;

    if (enrollmentIntervalRef.current) clearInterval(enrollmentIntervalRef.current);
    if (enrollmentTimeoutRef.current) clearTimeout(enrollmentTimeoutRef.current);

    enrollmentIntervalRef.current = setInterval(() => {
      enrollmentTicksRef.current += 1;
      const elapsed = enrollmentTicksRef.current * 120;
      setEnrollmentProgress(Math.min(100, Math.round((elapsed / ENROLLMENT_TARGET_MS) * 100)));

      if (lastCentroidRef.current > 0 && lastVoiceEnergyRef.current >= VOICE_ENERGY_THRESHOLD) {
        enrollmentSamplesRef.current.push(lastCentroidRef.current);
      }
    }, 120);

    const finalizeEnrollment = () => {
      if (enrollmentIntervalRef.current) {
        clearInterval(enrollmentIntervalRef.current);
        enrollmentIntervalRef.current = null;
      }
      if (enrollmentTimeoutRef.current) {
        clearTimeout(enrollmentTimeoutRef.current);
        enrollmentTimeoutRef.current = null;
      }
      setEnrollingSpeaker(null);

      const samples = enrollmentSamplesRef.current;
      enrollmentSamplesRef.current = [];

      if (samples.length < ENROLLMENT_MIN_SAMPLES) {
        setEnrollmentProgress(0);
        setSessionError('Недостатньо голосових даних. Говоріть довше і чіткіше (10-12 секунд) та повторіть навчання.');
        return;
      }

      const avg = samples.reduce((acc, value) => acc + value, 0) / samples.length;
      const variance = samples.reduce((acc, value) => acc + (value - avg) ** 2, 0) / samples.length;
      const std = Math.sqrt(variance);
      setVoiceProfiles((prev) => ({ ...prev, [speaker]: { mean: avg, std } }));
      setAutoInfo(`Еталон для ${speaker === 'client' ? 'клієнта' : 'психолога'} оновлено (фреймів: ${samples.length}).`);
      setEnrollmentProgress(100);
      enrollmentTicksRef.current = 0;
      finalizeEnrollmentRef.current = null;
    };

    enrollmentTimeoutRef.current = setTimeout(finalizeEnrollment, ENROLLMENT_TARGET_MS);
    finalizeEnrollmentRef.current = finalizeEnrollment;
  };

  const finishEnrollmentEarly = () => {
    if (!enrollingSpeaker) return;
    if (typeof finalizeEnrollmentRef.current === 'function') {
      finalizeEnrollmentRef.current();
    }
  };

  const stopListening = () => {
    shouldKeepListeningRef.current = false;
    desiredSpeakerRef.current = null;

    if (enrollmentIntervalRef.current) {
      clearInterval(enrollmentIntervalRef.current);
      enrollmentIntervalRef.current = null;
    }
    if (enrollmentTimeoutRef.current) {
      clearTimeout(enrollmentTimeoutRef.current);
      enrollmentTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    teardownAudioMonitor();
    setIsListening(false);
    setActiveSpeaker(null);
    setInterimText('');
    setEnrollingSpeaker(null);
    setEnrollmentProgress(0);
    enrollmentSamplesRef.current = [];
    enrollmentTicksRef.current = 0;
    finalizeEnrollmentRef.current = null;
    utteranceCentroidSamplesRef.current = [];
  };

  const startListening = async (speaker) => {
    setSessionError('');
    shouldKeepListeningRef.current = true;
    desiredSpeakerRef.current = speaker;
    utteranceCentroidSamplesRef.current = [];
    if (speaker === 'auto') {
      if (!canRunAutoMode) {
        shouldKeepListeningRef.current = false;
        desiredSpeakerRef.current = null;
        setSessionError('Для авто-розпізнавання спершу навчіть обидва голоси: клієнта і психолога.');
        return;
      }
      const ok = await ensureAudioMonitor();
      if (!ok) {
        shouldKeepListeningRef.current = false;
        desiredSpeakerRef.current = null;
        return;
      }
      setAutoInfo('Авто-режим активний: використовуються обидва голосові еталони.');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      shouldKeepListeningRef.current = false;
      desiredSpeakerRef.current = null;
      setSessionError('Ваш браузер не підтримує Web Speech API. Рекомендовано Google Chrome.');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'uk-UA';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interim = '';
      const finalChunks = [];

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const chunk = event.results[i][0].transcript.trim();
        if (event.results[i].isFinal) {
          if (chunk) finalChunks.push(chunk);
        } else {
          interim += ` ${chunk}`;
          if (speaker === 'auto' && lastCentroidRef.current > 0) {
            utteranceCentroidSamplesRef.current.push(lastCentroidRef.current);
          }
        }
      }

      setInterimText(interim.trim());

      if (finalChunks.length > 0) {
        const finalText = finalChunks.join(' ').trim();
        let resolvedSpeaker = speaker;
        let autoMeta = null;

        if (speaker === 'auto') {
          autoMeta = inferSpeakerAuto(finalText);
          resolvedSpeaker = autoMeta.speaker;
          setAutoInfo(
            `Авто-розпізнавання: ${resolvedSpeaker === 'client' ? 'клієнт' : 'психолог'} (${autoMeta.confidence} впевненість)`
          );
        }

        setEntries((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            speaker: resolvedSpeaker,
            text: finalText,
            time: nowTimeLabel(),
            autoAssigned: speaker === 'auto',
            autoConfidence: autoMeta?.confidence || null,
          },
        ]);
        setInterimText('');
        utteranceCentroidSamplesRef.current = [];
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted' || event.error === 'no-speech') {
        return;
      }

      if (event.error === 'network' || event.error === 'audio-capture' || event.error === 'not-allowed') {
        setSessionError(`Помилка розпізнавання: ${event.error}. Перевірте доступ до мікрофона.`);
        shouldKeepListeningRef.current = false;
      } else {
        setSessionError(`Помилка розпізнавання: ${event.error}`);
      }

      utteranceCentroidSamplesRef.current = [];

      if (!shouldKeepListeningRef.current) {
        stopListening();
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      utteranceCentroidSamplesRef.current = [];

      if (shouldKeepListeningRef.current && desiredSpeakerRef.current === speaker) {
        window.setTimeout(() => {
          if (shouldKeepListeningRef.current && desiredSpeakerRef.current === speaker) {
            startListening(speaker);
          }
        }, 180);
        return;
      }

      setIsListening(false);
      setActiveSpeaker(null);
      setInterimText('');
    };

    recognition.start();
    recognitionRef.current = recognition;
    setActiveSpeaker(speaker);
    setIsListening(true);
  };

  const clearSession = () => {
    stopListening();
    if (enrollmentIntervalRef.current) {
      clearInterval(enrollmentIntervalRef.current);
      enrollmentIntervalRef.current = null;
    }
    if (enrollmentTimeoutRef.current) {
      clearTimeout(enrollmentTimeoutRef.current);
      enrollmentTimeoutRef.current = null;
    }
    setEnrollingSpeaker(null);
    setEntries([]);
    setSessionError('');
    setAutoInfo('');
    setEnrollmentProgress(0);
  };

  const relabelEntrySpeaker = (entryId, speaker) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;
        return {
          ...entry,
          speaker,
          autoAssigned: false,
          manualOverride: true,
          autoConfidence: null,
        };
      })
    );
  };

  const exportSession = () => {
    const lines = entries.map((entry) => {
      const speakerLabel = entry.speaker === 'client' ? 'КЛІЄНТ' : 'ПСИХОЛОГ';
      return `[${entry.time}] ${speakerLabel}: ${entry.text}`;
    });

    const report = [
      'Сесія: Жива транскрипція',
      `Дата: ${new Date().toLocaleString('uk-UA')}`,
      '',
      '--- ТРАНСКРИПТ ---',
      ...lines,
      '',
      '--- AI-ІНСАЙТИ (MVP) ---',
      `Ризик дистресу: ${insights.riskLevel}`,
      `Баланс мовлення клієнта: ${insights.clientShare}%`,
      `Фокус: ${insights.focus.join('; ')}`,
      `Рекомендації: ${insights.therapistTips.join(' ')}`,
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 mb-20 pt-28 space-y-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-teal-700 font-bold transition-colors"
      >
        <FaArrowLeft /> Повернутися в кабінет
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2.2rem] border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-cyan-700 mb-1">Live Session AI</p>
              <h1 className="text-3xl brand-display font-bold text-slate-900">Транскрипція зустрічі в реальному часі</h1>
              <p className="text-slate-500 font-medium mt-2">Ручний режим або авто-розпізнавання спікера на базі голосових еталонів.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => startListening('client')}
                className={`px-4 py-2.5 rounded-xl font-bold border transition-colors ${
                  isListening && activeSpeaker === 'client'
                    ? 'bg-cyan-700 text-white border-cyan-700'
                    : 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100'
                }`}
              >
                <FaUser className="inline mr-2" /> Мікрофон клієнта
              </button>
              <button
                onClick={() => startListening('psychologist')}
                className={`px-4 py-2.5 rounded-xl font-bold border transition-colors ${
                  isListening && activeSpeaker === 'psychologist'
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                }`}
              >
                <FaUserMd className="inline mr-2" /> Мікрофон психолога
              </button>
              <button
                onClick={() => startListening('auto')}
                disabled={!canRunAutoMode}
                className={`px-4 py-2.5 rounded-xl font-bold border transition-colors ${
                  isListening && activeSpeaker === 'auto'
                    ? 'bg-indigo-700 text-white border-indigo-700'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                } disabled:opacity-50`}
              >
                <FaMicrophone className="inline mr-2" /> Авто-розпізнавання
              </button>
              <button
                onClick={stopListening}
                disabled={!isListening}
                className="px-4 py-2.5 rounded-xl font-bold border bg-white text-slate-700 border-slate-200 hover:bg-slate-50 disabled:opacity-50"
              >
                <FaStop className="inline mr-2" /> Стоп
              </button>
            </div>
          </div>

          <div className="mb-5 bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-black mb-3">Навчання голосу (авто-режим)</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => startEnrollment('client')}
                disabled={!!enrollingSpeaker}
                className="px-3 py-2 rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-800 font-bold text-sm hover:bg-cyan-100 disabled:opacity-50"
              >
                <FaUser className="inline mr-2" />
                {enrollingSpeaker === 'client' ? 'Записуємо клієнта...' : 'Навчити голос клієнта'}
              </button>
              <button
                onClick={() => startEnrollment('psychologist')}
                disabled={!!enrollingSpeaker}
                className="px-3 py-2 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 font-bold text-sm hover:bg-teal-100 disabled:opacity-50"
              >
                <FaUserMd className="inline mr-2" />
                {enrollingSpeaker === 'psychologist' ? 'Записуємо психолога...' : 'Навчити голос психолога'}
              </button>
              <button
                onClick={finishEnrollmentEarly}
                disabled={!enrollingSpeaker}
                className="px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 font-bold text-sm hover:bg-indigo-100 disabled:opacity-50"
              >
                Завершити навчання
              </button>
            </div>

            {enrollingSpeaker && (
              <div className="mb-3">
                <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all"
                    style={{ width: `${enrollmentProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Збір голосового еталону: {enrollmentProgress}%
                </p>
              </div>
            )}

            <div className="text-sm font-medium text-slate-600 space-y-1">
              <p>
                Еталон клієнта: {voiceProfiles.client ? 'готово' : 'не налаштовано'}
              </p>
              <p>
                Еталон психолога: {voiceProfiles.psychologist ? 'готово' : 'не налаштовано'}
              </p>
              {!canRunAutoMode && (
                <p className="text-amber-700">Авто-режим буде доступний після навчання обох голосів.</p>
              )}
              {autoInfo && <p className="text-indigo-700">{autoInfo}</p>}
            </div>
          </div>

          {sessionError && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 font-medium">
              {sessionError}
            </div>
          )}

          {isListening && interimText && (
            <div className="mb-5 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-black mb-1">Проміжне розпізнавання</p>
              <p className="text-slate-700 font-medium italic">{interimText}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-800">Транскрипт сесії</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmAutoTagMode((prev) => !prev)}
                className={`px-3 py-2 rounded-lg border font-bold text-sm transition-colors ${
                  confirmAutoTagMode
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Підтвердження auto-tag: {confirmAutoTagMode ? 'УВІМК' : 'ВИМК'}
              </button>
              <button
                onClick={clearSession}
                className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm"
              >
                <FaTrash className="inline mr-2" /> Очистити
              </button>
              <button
                onClick={exportSession}
                disabled={entries.length === 0}
                className="px-3 py-2 rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 font-bold text-sm disabled:opacity-50"
              >
                <FaDownload className="inline mr-2" /> Експорт TXT
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
            {entries.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500 font-medium">
                Поки немає розпізнаних реплік. Натисніть один із мікрофонів, щоб почати.
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`rounded-2xl p-4 border ${
                    entry.speaker === 'client'
                      ? 'bg-cyan-50 border-cyan-200'
                      : 'bg-teal-50 border-teal-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                      {entry.speaker === 'client' ? 'Клієнт' : 'Психолог'}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{entry.time}</span>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{entry.text}</p>
                  {entry.autoAssigned && (
                    <div className="mt-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      Auto-tag: {entry.autoConfidence || 'низька'} впевненість
                    </div>
                  )}
                  {entry.manualOverride && (
                    <div className="mt-2 text-[11px] font-bold text-emerald-700 uppercase tracking-widest">
                      Підтверджено вручну
                    </div>
                  )}
                  {confirmAutoTagMode && entry.autoAssigned && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => relabelEntrySpeaker(entry.id, 'client')}
                        className="px-2.5 py-1.5 rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-800 text-xs font-bold hover:bg-cyan-100"
                      >
                        Позначити як: Клієнт
                      </button>
                      <button
                        onClick={() => relabelEntrySpeaker(entry.id, 'psychologist')}
                        className="px-2.5 py-1.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 text-xs font-bold hover:bg-teal-100"
                      >
                        Позначити як: Психолог
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-5 min-w-0">
          <div className="bg-white rounded-[2.2rem] border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <FaBrain className="text-cyan-700" /> AI-інсайти (реальний час)
            </h3>

            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-black mb-1">Рівень дистресу</div>
                <div className={`font-black ${
                  insights.riskLevel === 'Високий' ? 'text-rose-700' : insights.riskLevel === 'Помірний' ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {insights.riskLevel}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-black mb-1 flex items-center gap-2">
                  <FaBalanceScale /> Баланс мовлення клієнта
                </div>
                <div className="font-black text-slate-800">{insights.clientShare}%</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.2rem] border border-slate-200 shadow-sm p-6">
            <h4 className="text-sm uppercase tracking-widest text-slate-400 font-black mb-3">Фокус сесії</h4>
            <div className="space-y-2">
              {insights.focus.map((item, idx) => (
                <div key={idx} className="text-slate-700 font-medium bg-slate-50 border border-slate-200 rounded-xl p-3">
                  • {item}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 rounded-[2.2rem] border border-amber-200 shadow-sm p-6">
            <h4 className="text-sm uppercase tracking-widest text-amber-700 font-black mb-3 flex items-center gap-2">
              <FaExclamationTriangle /> Підказки психологу
            </h4>
            <div className="space-y-2">
              {insights.therapistTips.map((item, idx) => (
                <div key={idx} className="text-amber-900 font-medium bg-white/70 border border-amber-200 rounded-xl p-3">
                  • {item}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.2rem] border border-slate-200 shadow-sm p-6">
            <h4 className="text-sm uppercase tracking-widest text-slate-400 font-black mb-3">Профіль клієнта в реальному часі</h4>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Оброблено слів клієнта: {realtimeProfile.words}
            </p>

            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Big Five</p>
                <div className="h-[220px] min-w-0">
                  <ResponsiveContainer width="100%" height={220} minWidth={0}>
                    <RadarChart data={bigFiveChart}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                      <Radar dataKey="val" stroke="#0891b2" fill="#0891b2" fillOpacity={0.35} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Maslow</p>
                <div className="h-[230px] min-w-0">
                  <ResponsiveContainer width="100%" height={230} minWidth={0}>
                    <BarChart data={maslowChart} margin={{ left: -24, right: 4, top: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="val" radius={[8, 8, 0, 0]}>
                        {maslowChart.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Schwartz</p>
                <div className="h-[230px] min-w-0">
                  <ResponsiveContainer width="100%" height={230} minWidth={0}>
                    <RadarChart data={schwartzChart}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} />
                      <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                      <Radar dataKey="val" stroke="#0f766e" fill="#0f766e" fillOpacity={0.28} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
