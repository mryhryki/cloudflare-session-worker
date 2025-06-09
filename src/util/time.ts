export const getNowUnixSec = (): number => {
  return Math.floor(Date.now() / 1000);
};

export const isLive = (unixSec: number): boolean => {
  return getNowUnixSec() < unixSec;
};

export const toDate = (unixSec: number): Date => {
  const date = new Date();
  date.setTime(unixSec * 1000);
  return date;
};
