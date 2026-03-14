export const getAcademicYear = (date: Date = new Date()) => {
  return date.getMonth() + 1 >= 4 ? date.getFullYear() : date.getFullYear() - 1;
};
