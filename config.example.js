const config = {
  get location() {
    return {
      lat: 0,
      lng: 0,
    };
  },

  discord: {
    token: "",
    channels: [],
  },

  linear: {
    token: "",
  },

  routines: {
    example: ["ping", "translate bien le bonjour"],
  },

  calendars: [],

  backupCommand: "",

  now: {
    blogUrl: "https://blog.joewoods.dev",
    lastFmApiKey: "",
    lastFmUsername: "",
    mastodonApiUrl: "https://oldinternet.net/api/v1/accounts/1/statuses",
    whatpulseUsername: "",
  },
};

export default config;
