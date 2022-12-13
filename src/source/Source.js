import { PrismaClient } from "@prisma/client";

class Source {
  constructor() {
    this.prisma = new PrismaClient();
  }

  get today() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
}

export { Source };
