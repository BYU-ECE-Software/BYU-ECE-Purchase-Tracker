////Helper to format date as MM-DD-YYYY

export const formatDate = (isoString: string): string => {
  const [year, month, day] = isoString.split(/[T ]/)[0].split('-');
  return `${month}/${day}/${year}`;
};
