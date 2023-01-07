const setMinutesFractional = (modifiedDate, minutes) => {
  const seconds = (minutes % 1) * 60;
  modifiedDate.setMinutes(minutes, seconds, (seconds % 1) * 60);
};

const asciiCalendar = function ({
  startTime = new Date(),
  endTime = (() => {
    const now = new Date();
    now.setHours(now.getHours() + 4, 0, 0, 0);
    return now;
  })(),
  notchesPerHour = 4,
} = {}) {
  const minuteInterval = 60 / notchesPerHour;

  // Find the first displayable target that's before the start time
  const startMinutes =
    Math.floor(startTime.getMinutes() / minuteInterval) * minuteInterval;

  // If we have no minute part, just do e.g. `14 `. (Note trailing space)
  let leftColumnLength = 3;
  if (notchesPerHour > 1 && startMinutes) {
    // e.g. `14:15 ` or `14:08.57 `.
    leftColumnLength = 4 + (60 % notchesPerHour ? 5 : 2);
  }

  let timer = new Date();
  setMinutesFractional(timer, startMinutes);

  let result = ``;
  let firstLoop = true;
  while (timer <= endTime) {
    let prefix = "";
    const minutes = timer.getMinutes();

    if (firstLoop || !minutes) {
      prefix += String(timer.getHours()).padStart(2, "0");

      if (minutes) {
        prefix += ":";
        prefix += String(minutes).padStart(2, "0");

        const seconds = timer.getSeconds();
        if (seconds) {
          prefix += (seconds / 60).toFixed(2).slice(1);
        }
      }
    }

    prefix = prefix.padEnd(leftColumnLength, " ");

    const nextTime = new Date(timer);
    setMinutesFractional(nextTime, minutes + minuteInterval);

    if (firstLoop) {
      if (minutes) {
        prefix += "┌";
      } else {
        prefix += "┬";
      }
      firstLoop = false;
    } else if (nextTime > endTime) {
      if (minutes) {
        prefix += "┘";
      } else {
        prefix += "┴";
      }
    } else {
      if (minutes) {
        prefix += "│";
      } else {
        prefix += "┤";
      }
    }

    timer = nextTime;
    result += prefix + "\n";
  }

  return result;
};

export { asciiCalendar };
