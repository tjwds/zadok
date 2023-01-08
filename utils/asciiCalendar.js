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
  events = [],
  eventWidth = 25,
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

  let timer = new Date(startTime);
  setMinutesFractional(timer, startMinutes);

  const eventsToShow = events.filter((event) => {
    const { start, end } = event;
    if (start < timer) {
      return end > timer;
    }
    return start <= endTime;
  });

  const lines = new Map();

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

    lines.set(Number(timer), { prefix });
    timer = nextTime;
  }

  eventsToShow.forEach((event) => {
    const { start, end, title } = event;

    const eventStartTime = new Date(start);
    setMinutesFractional(
      eventStartTime,
      Math.floor(eventStartTime.getMinutes() / minuteInterval) * minuteInterval
    );
    const eventEndTime = new Date(end);
    setMinutesFractional(
      eventEndTime,
      (Math.ceil(eventEndTime.getMinutes() / minuteInterval) - 1) *
        minuteInterval
    );

    let timer = new Date(eventStartTime);
    let startsOutside = false;
    let seenAdd = false;

    // TODO truncate if too wide
    const toPush = [];
    let bestIndex = 0;

    while (timer <= eventEndTime) {
      const minutes = timer.getMinutes();
      const target = lines.get(Number(timer));
      if (!target) {
        if (timer === eventStartTime) {
          startsOutside = true;
        } else if (seenAdd) {
          break;
        }
        setMinutesFractional(timer, minutes + minuteInterval);
        continue;
      }

      seenAdd = true;
      let { events } = target;
      if (!events) {
        events = target.events = [];
      }
      for (let i = 0; i <= events.length; i++) {
        let item = events[i];
        if (!item) {
          if (i > bestIndex) {
            bestIndex = i;
          }
          break;
        }
      }

      const nextTime = new Date(timer);
      setMinutesFractional(nextTime, minutes + minuteInterval);
      const timeNumber = Number(timer);
      if (timeNumber === Number(eventStartTime)) {
        let formattedTitle = title;
        if (formattedTitle.length > eventWidth - 2) {
          formattedTitle = formattedTitle.slice(0, eventWidth - 3) + "…";
        }
        if (startsOutside) {
          toPush.push([
            timeNumber,
            formattedTitle.padEnd(eventWidth - 1, " ") + "│",
          ]);
        } else {
          toPush.push([
            timeNumber,
            formattedTitle.padEnd(eventWidth - 1, "─") +
              (nextTime > eventEndTime ? "─" : "┐"),
          ]);
        }
      } else if (timeNumber === Number(eventEndTime)) {
        toPush.push([timeNumber, "└" + "─".repeat(eventWidth - 2) + "┘"]);
      } else {
        toPush.push([timeNumber, "│" + " ".repeat(eventWidth - 2) + "│"]);
      }

      timer = nextTime;
    }

    toPush.forEach(([numIndex, entry]) => {
      const target = lines.get(numIndex);
      target.events[bestIndex] = entry;
    });
  });

  let result = "";
  let linesIterator = new Date(startTime);
  setMinutesFractional(linesIterator, startMinutes);

  while (linesIterator <= endTime) {
    const { prefix, events = [] } = lines.get(Number(linesIterator));

    result += prefix;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (!event) {
        result += " " + " ".repeat(eventWidth);
      } else {
        result += " " + event;
      }
    }

    result += "\n";

    setMinutesFractional(
      linesIterator,
      linesIterator.getMinutes() + minuteInterval
    );
  }

  return result;
};

// TODO actual tests would be nice
// console.log(
//   asciiCalendar({
//     events: [
//       {
//         start: new Date("2023-01-08T17:15:00.000Z"),
//         end: new Date("2023-01-08T18:15:00.000Z"),
//         title: "Test",
//       },
//       {
//         start: new Date("2023-01-08T17:00:00.000Z"),
//         end: new Date("2023-01-08T18:00:00.000Z"),
//         title: "This is a really long event title isn't it?",
//       },
//       {
//         start: new Date("2023-01-08T18:00:00.000Z"),
//         end: new Date("2023-01-08T18:15:00.000Z"),
//         title: "Test",
//       },
//       {
//         start: new Date("2023-01-08T18:15:00.000Z"),
//         end: new Date("2023-01-08T19:00:00.000Z"),
//         title: "Test",
//       },
//     ],
//   })
// );

export { asciiCalendar };
