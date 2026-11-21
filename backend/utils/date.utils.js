/**
 * Date and Timezone Utilities for Cycle & Checklist operations
 */

/**
 * Normalizes a date to midnight (00:00:00.000 UTC) considering optional timezone offset in minutes.
 * @param {Date|string} inputDate
 * @param {number} offsetMinutes e.g. -360 for UTC+6 (as returned by client Date.getTimezoneOffset())
 * @returns {Date} Normalized Date at 00:00:00.000 UTC
 */
const normalizeToMidnight = (inputDate, offsetMinutes = 0) => {
  const d = inputDate ? new Date(inputDate) : new Date();

  if (isNaN(d.getTime())) {
    throw new Error('Invalid date provided.');
  }

  const offset = parseInt(offsetMinutes || 0, 10);
  // Subtract client offset (in ms) to find client's local calendar day
  const localTime = new Date(d.getTime() - offset * 60 * 1000);

  return new Date(
    Date.UTC(localTime.getUTCFullYear(), localTime.getUTCMonth(), localTime.getUTCDate(), 0, 0, 0, 0)
  );
};

/**
 * Computes the 1-based cycle day number (1 to 30) between cycle start date and target date.
 * @param {Date|string} startDate
 * @param {Date|string} currentDate
 * @param {number} offsetMinutes
 * @returns {number}
 */
const calculateDayNumber = (startDate, currentDate, offsetMinutes = 0) => {
  const start = normalizeToMidnight(startDate, offsetMinutes);
  const current = normalizeToMidnight(currentDate, offsetMinutes);

  const diffMs = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays + 1;
};

module.exports = {
  normalizeToMidnight,
  calculateDayNumber
};
