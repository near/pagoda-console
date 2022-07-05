import { PrismaClient } from '../../../generated/prisma/alerts';
import { createHash, randomBytes, randomInt } from 'crypto';
const prisma = new PrismaClient();

function randomHash() {
  const randomString = randomBytes(20).toString('hex');
  return createHash('sha256').update(randomString).digest('hex');
}

async function main() {
  await prisma.$connect();

  const firstAlert = await prisma.alert.findFirst();
  const startMillis = new Date().getMilliseconds();
  for (let i = 0; i < 10; i++) {
    const triggeredAlert = await prisma.triggeredAlert.create({
      data: {
        alert: {
          connect: { id: firstAlert.id },
        },
        triggeredInBlockHash: randomHash(),
        triggeredInTransactionHash: randomHash(),
        triggeredInReceiptId: randomInt(0, 1000000),
        triggeredAt: new Date(startMillis + i),
        extraData: { foo: 'bar' },
      },
    });
    console.log('Created: ', { triggeredAlert });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
