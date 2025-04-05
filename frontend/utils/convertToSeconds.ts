interface Duration {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export const convertToSeconds = ({
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
}: Duration): number => {
  return days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;
};
