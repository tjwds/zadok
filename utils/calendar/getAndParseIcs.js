import ical from "node-ical";

const getAndParseIcs = async function (url) {
  const result = await ical.fromURL(url);

  // TODO recurrences
  const values = Object.values(result)
    .filter((event) => event.type === "VEVENT")
    .map((event) => {
      return {
        start: new Date(event.start.toISOString()),
        end: new Date(event.end.toISOString()),
        title: event.summary,
        // TODO event colors :-)
      };
    });

  return values;
};

export { getAndParseIcs };
