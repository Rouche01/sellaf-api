import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import differenceInDays from 'date-fns/differenceInDays';

export const getDifferenceInMsFromNow = (inputDate: Date): number => {
  return differenceInMilliseconds(new Date(inputDate), new Date());
};

export const getDifferenceInSecondsFromNow = (inputDate: Date): number => {
  return differenceInSeconds(new Date(inputDate), new Date());
};

export const getDifferenceInSecondsTillNow = (inputDate: Date): number => {
  return differenceInSeconds(new Date(), new Date(inputDate));
};

export const getDifferenceInDaysTillNow = (inputDate: Date): number => {
  return differenceInDays(new Date(), new Date(inputDate));
};
