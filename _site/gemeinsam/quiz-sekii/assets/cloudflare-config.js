(() => {
  const production = 'https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev';
  const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && location.port === '8789';
  window.MATHE_QUIZ_CLOUD = Object.freeze({
    enabled: true,
    baseUrl: local || location.origin === production ? location.origin : production,
  });
})();
