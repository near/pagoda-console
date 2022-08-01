/*
  Generates mock Triggered Alert data.
  Run by (globally) installing ts-node then run
    ts-node alertHistory.seed.ts

  Creates 10 records with a 1s delay between records. To create more, change line 59.
*/

import { Alert, PrismaClient } from '../../../generated/prisma/alerts';
import { createHash, randomBytes } from 'crypto';
const prisma = new PrismaClient();

function randomHash() {
  const randomString = randomBytes(20).toString('hex');
  return createHash('sha256').update(randomString).digest('base64');
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
      triggeredInReceiptId: randomHash(),
      triggeredAt: new Date(),
      extraData: { foo: 'bar' },
    },
  });
  console.log('Created: ', { triggeredAlert });
}

async function main() {
  await prisma.$connect();

  const firstAlert = await prisma.alert.findFirst();

  if (!firstAlert) {
    console.error(
      'Please generate at least 1 alert before running this script',
    );
    process.exit(1);
  }

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
