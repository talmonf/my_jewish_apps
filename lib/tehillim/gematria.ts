const ONES = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const TENS = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const HUNDREDS = ["", "ק", "ר", "ש", "ת"];

export function toHebrewNumeral(value: number) {
  if (value <= 0 || value > 999) {
    return String(value);
  }

  let remaining = value;
  let result = "";

  if (remaining >= 100) {
    result += HUNDREDS[Math.floor(remaining / 100)];
    remaining %= 100;
  }

  if (remaining === 15) {
    result += "טו";
    return result;
  }

  if (remaining === 16) {
    result += "טז";
    return result;
  }

  if (remaining >= 10) {
    result += TENS[Math.floor(remaining / 10)];
    remaining %= 10;
  }

  result += ONES[remaining];
  return result || "א";
}

export function toHebrewVerseLabel(verse: number) {
  return toHebrewNumeral(verse);
}
