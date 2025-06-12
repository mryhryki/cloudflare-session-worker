/**
 * Date -> Unix timestamp in seconds
 *
 * @param {Date} date
 * @return {number} Unix timestamp in seconds
 */
export const getUnixSec = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

/**
 * Unix timestamp in seconds -> Date
 *
 * @param {number} unixSec
 * @return {Date}
 */
export const toDate = (unixSec: number): Date => {
  const date = new Date();
  date.setTime(unixSec * 1000);
  return date;
};

/**
 * Check if a given Unix timestamp in seconds is after a specified base date.
 *
 * @param {number} unixSec
 * @param {Date|undefined} baseDate (Default: current date)
 * @return {boolean} True if unixSec is after baseDate, false otherwise
 */
export const isAfter = (unixSec: number, baseDate: Date): boolean => {
  return getUnixSec(baseDate) < unixSec;
};
