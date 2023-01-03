import { networkInterfaces } from "os";

const getIP = function () {
  const interfaces = Object.values(networkInterfaces());
  for (let i = 0; i < interfaces.length; i++) {
    // lol "interface" is a reserved word
    const inter = interfaces[0];
    for (let j = 0; j < inter.length; j++) {
      const result = inter[j];
      // XXX I think some other platforms report this as 4 but I'm not on
      // those platforms
      if (!result.internal && result.family === "IPv4") {
        return result.address;
      }
    }
  }

  return null;
};

export { getIP };
