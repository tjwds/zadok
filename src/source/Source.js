import { PrismaClient } from "@prisma/client";

class Source {
  constructor() {
    this.prisma = new PrismaClient();
  }
}

export { Source };
