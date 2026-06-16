const TEAMIM_PATTERN = /[\u0591-\u05AF\u05BD\u05BF]/g;

export function stripTeamim(hebrew: string) {
  return hebrew.replace(TEAMIM_PATTERN, "");
}

export function splitHebrewWords(hebrew: string) {
  return hebrew.split(/\s+/).filter(Boolean);
}
