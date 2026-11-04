import {HttpError} from './security.mjs';

export const LEARNING_PATH_ID = 'uniform-motion-v1';
export const MODES = ['single_chat', 'classroom'];
export const DEFAULT_COACH_CONFIG = {
  allowedLearningModes: MODES,
  defaultLearningMode: 'single_chat',
  singleChat: {transportMode: 'fobizz-api'},
  classroom: {transportMode: 'fobizz-transfer'}
};

export function coachConfig(value = DEFAULT_COACH_CONFIG) {
  const modes = value?.allowedLearningModes;
  if (!Array.isArray(modes) || !modes.length || modes.length > 2 ||
      new Set(modes).size !== modes.length || modes.some(m => !MODES.includes(m)) ||
      !modes.includes(value.defaultLearningMode) ||
      value.singleChat?.transportMode !== 'fobizz-api' ||
      !['fobizz-api', 'fobizz-transfer'].includes(value.classroom?.transportMode)) {
    throw new HttpError(400, 'Lernmodi und Übertragungswege prüfen. Einzelchat benötigt eine bestätigte API.');
  }
  return {allowedLearningModes: [...modes], defaultLearningMode: value.defaultLearningMode,
    singleChat: {transportMode: value.singleChat.transportMode},
    classroom: {transportMode: value.classroom.transportMode}};
}

export function initializeCoach(learner, room) {
  // Bestehende v2-Lernplätze behalten ihren bisherigen Klassenraum-Transfer.
  learner.learningMode ??= room.coachConfig?.defaultLearningMode || 'classroom';
  learner.modeVersion ??= 1;
  learner.chatContexts ??= {};
}

export function capabilities(room, adapterReady = false) {
  const config = room.coachConfig || {...DEFAULT_COACH_CONFIG, defaultLearningMode: 'classroom'};
  return MODES.map(learningMode => {
    const transportMode = learningMode === 'single_chat' ? config.singleChat.transportMode : config.classroom.transportMode;
    const allowed = config.allowedLearningModes.includes(learningMode);
    const ready = allowed && (transportMode === 'fobizz-api' ? adapterReady : Boolean(room.fobizzUrl));
    return {learningMode, transportMode, allowed, available: ready,
      status: !allowed ? 'disabled' : ready ? 'ready' : transportMode === 'fobizz-api' ? 'api_unconfirmed' : 'setup_required'};
  });
}

export function selectedCapability(learner, room, adapterReady) {
  return capabilities(room, adapterReady).find(c => c.learningMode === learner.learningMode);
}

export function requireTransport(learner, room, transportMode, adapterReady) {
  const selected = selectedCapability(learner, room, adapterReady);
  if (!selected?.allowed || selected.transportMode !== transportMode) throw new HttpError(409, 'Dieser Übertragungsweg gehört nicht zum gewählten Lernmodus.');
  if (!selected.available) throw new HttpError(transportMode === 'fobizz-api' ? 501 : 409,
    transportMode === 'fobizz-api' ? 'Die automatische fobizz-Schnittstelle ist noch nicht bestätigt.' : 'Die Lehrkraft muss zuerst einen fobizz-Zugang hinterlegen.');
}

export function conversation(learner) {
  learner.chatContexts[LEARNING_PATH_ID] ??= {};
  return learner.chatContexts[LEARNING_PATH_ID][learner.learningMode] ??= {contextId: crypto.randomUUID(), messages: []};
}

export function publicMessages(learner) {
  return learner.chatContexts?.[LEARNING_PATH_ID]?.[learner.learningMode]?.messages || [];
}

export function requireModeVersion(learner, body) {
  if (body.modeVersion !== learner.modeVersion) throw new HttpError(409, 'Der Lernmodus hat sich geändert. Bitte den aktuellen Stand laden.');
}
