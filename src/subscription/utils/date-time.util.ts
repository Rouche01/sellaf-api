import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import differenceInSeconds from 'date-fns/differenceInSeconds';

export const getDifferenceInMsFromNow = (inputDate: Date): number => {
  return differenceInMilliseconds(new Date(inputDate), new Date());
};

export const getDifferenceInSecondsFromNow = (inputDate: Date): number => {
  return differenceInSeconds(new Date(inputDate), new Date());
};
