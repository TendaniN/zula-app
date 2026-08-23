export const getFullName = (fName: string | null, lName: string | null) => {
  return `${fName ?? ""} ${lName ?? ""}`;
};
