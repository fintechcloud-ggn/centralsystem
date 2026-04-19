const buildDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatContestDate = (value) => {
  const parsed = buildDate(value);
  if (!parsed) return "";

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};

export const formatContestTime = (value) => {
  const parsed = buildDate(value);
  if (!parsed) return "";

  return parsed.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
};
