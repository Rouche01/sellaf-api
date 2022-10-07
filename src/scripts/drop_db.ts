import { PrismaService } from '../prisma';

(async () => {
  const prisma = new PrismaService();
  prisma.cleanDb();
})();
