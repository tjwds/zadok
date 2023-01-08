import ical from "node-ical";

const getAndParseIcs = async function (url) {
  const result = await ical.fromURL(url);

  // TODO recurrences
  const values = Object.values(result)
    .filter((event) => event.type === "VEVENT")
    .map((event) => {
      return {
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        title: event.summary,
      };
    });

  return values;
};

export { getAndParseIcs };
