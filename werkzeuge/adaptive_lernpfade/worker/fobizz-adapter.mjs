// Bewusst keine erfundene URL, kein Browser-Scraping und keine Session-Cookies.
// Hier nach schriftlicher Bestätigung der unterstützten fobizz-API integrieren.
// Eingabe: nur das minimierte Kompetenzprofil aus coachPacket().
// Ausgabe: dasselbe geprüfte Objekt wie beim manuellen Transfer.
export const fobizzAdapter = Object.freeze({
  // Erst mit dokumentiertem Providervertrag aktivieren. Kein Konfigurationsschalter
  // oder Browserparameter kann diese Sperre umgehen.
  ready: false,
  chat: callFobizz
});
export async function callFobizz(_packet, _env) {
  throw new Error('FOBIZZ_API_NOT_CONFIRMED');
}
