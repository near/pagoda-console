import { Alert, PrismaClient } from '../../../generated/prisma/alerts';
import { createHash, randomBytes, randomInt } from 'crypto';
const prisma = new PrismaClient();

function randomHash() {
  const randomString = randomBytes(20).toString('hex');
  return createHash('sha256').update(randomString).digest('hex');
}

async function createTriggeredAlertAndScheduleNext(
  alert,
  numberRemaining: number,
) {
  if (numberRemaining <= 0) {
    return;
  }
  await createTriggeredAlert(alert);
  setTimeout(
    () => createTriggeredAlertAndScheduleNext(alert, numberRemaining - 1),
    1000,
  );
}
async function createTriggeredAlert(firstAlert: Alert) {
  const triggeredAlert = await prisma.triggeredAlert.create({
    data: {
      alert: {
        connect: { id: firstAlert.id },
      },
      triggeredInBlockHash: randomHash(),
      triggeredInTransactionHash: randomHash(),
      triggeredInReceiptId: randomInt(0, 1000000),
      triggeredAt: new Date(),
      extraData: { foo: 'bar' },
    },
  });
  console.log('Created: ', { triggeredAlert });
}

async function main() {
  await prisma.$connect();

  const firstAlert = await prisma.alert.findFirst();
  const startMillis = new Date().getMilliseconds();
  createTriggeredAlertAndScheduleNext(firstAlert, 10);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
