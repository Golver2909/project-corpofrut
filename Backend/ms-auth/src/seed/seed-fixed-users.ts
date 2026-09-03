import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  const roles = await Promise.all(
    ['ADMIN', 'ORGANIZADOR', 'USUARIO'].map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const adminRole = roles.find((r) => r.name === 'ADMIN')!;
  const organizadorRole = roles.find((r) => r.name === 'ORGANIZADOR')!;

  const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
  await prisma.user.upsert({
    where: { email: 'admin@corpofrut.com' },
    update: {},
    create: {
      dni: 10000001,
      username: 'admin',
      email: 'admin@corpofrut.com',
      password: adminPassword,
      roleId: adminRole.id,
    },
  });

  const organizadorPassword = await bcrypt.hash('organizador123', SALT_ROUNDS);
  await prisma.user.upsert({
    where: { email: 'organizador@corpofrut.com' },
    update: {},
    create: {
      dni: 10000002,
      username: 'organizador',
      email: 'organizador@corpofrut.com',
      password: organizadorPassword,
      roleId: organizadorRole.id,
    },
  });

  console.log('Seed completado: roles + admin + organizador creados');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());