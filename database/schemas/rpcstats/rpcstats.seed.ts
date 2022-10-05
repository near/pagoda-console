/*
  Generates mock RPC stats data.
  Run by (globally) installing ts-node then run
    SEED_API_KEY=<A KEY TO USE> SEED_CONSUMER_NAME=<a consumer name> SEED_ORG_SLUG=<an org slug> SEED_CONSUMER_ID=foo ts-node rpcstats.seed.ts

  Creates 100 records with a 1ms delay between records. To create more, change ROWS_TO_CREATE.
*/

import {
  ApikeyEndpointMetricsPerBaseWindow,
  ApikeyGeographyMetricsPerBaseWindow,
  PrismaClient,
} from "../../clients/rpcstats";
import { DateTime } from "luxon";
import { createHash, randomBytes } from "crypto";
const prisma = new PrismaClient();

type metric =
  | ApikeyEndpointMetricsPerBaseWindow
  | ApikeyGeographyMetricsPerBaseWindow;

const ROWS_TO_CREATE = 900;
const WINDOW_LENGTH_IN_SECONDS = 15;
const startingSecondsAgo = WINDOW_LENGTH_IN_SECONDS * ROWS_TO_CREATE;
const startDateTime = DateTime.now()
  .setZone("UTC")
  .startOf("minute") // align window with minute
  .minus({ seconds: startingSecondsAgo });

function randomHash() {
  const randomString = randomBytes(20).toString("hex");
  return createHash("sha256").update(randomString).digest("base64");
}

function randomNumber(min: number, max: number) {
  return Math.random() * max + min;
}

async function createRowAndScheduleNext(numberRemaining: number) {
  if (numberRemaining <= 0) {
    return;
  }
  await createRow(ROWS_TO_CREATE - numberRemaining);
  createRowAndScheduleNext(numberRemaining - 1);
}
// 0 based iteration number
async function createRow(iteration: number) {
  const minLatency = Math.floor(randomNumber(30, 100));
  const maxLatency = Math.ceil(randomNumber(120, 500));
  const meanLatency = (minLatency + maxLatency) / 2; // not really since it's the mean of the window but fine for our fake data
  const windowStartTime = startDateTime.plus({
    seconds: WINDOW_LENGTH_IN_SECONDS * iteration,
  });
  const windowEndTime = windowStartTime
    .plus({ seconds: WINDOW_LENGTH_IN_SECONDS })
    .minus({ milliseconds: 1 });

  try {
    const row = await prisma.apikeyEndpointMetricsPerBaseWindow.create({
      data: {
        apiKeyIdentifier: process.env.SEED_API_KEY,
        apiKeyConsumerName: process.env.SEED_CONSUMER_NAME,
        apiKeyOrgSlug: process.env.SEED_ORG_SLUG,
        apiKeyConsumerId: process.env.SEED_CONSUMER_ID,
        successCount: Math.ceil(randomNumber(1, 100)),
        errorCount: Math.floor(randomNumber(1, 3)),
        network: "TESTNET",
        minLatency: minLatency,
        maxLatency: maxLatency,
        meanLatency: meanLatency,
        windowStartEpochMs: Math.floor(windowStartTime.toMillis()),
        windowEndEpochMs: Math.ceil(windowEndTime.toMillis()),
        // endpointGroup: 'Protocol',
        // endpointMethod: 'EXPERIMENTAL_genesis_config',
        // endpointGroup: 'Gas',
        // endpointMethod: 'gas_price',
        // endpointGroup: 'Network',
        // endpointMethod: 'status',
        endpointGroup: "Network",
        endpointMethod: "network_info",
        year: windowStartTime.year,
        month: windowStartTime.month,
        day: windowStartTime.day,
        hour24: windowStartTime.hour,
        minute: windowStartTime.minute,
        quarterMinute: windowStartTime.second / 15,
      },
    });
  } catch (e) {
    // console.error(e);
    console.error(
      "Error, likely there is already data for this endpoint and time. Continuing",
      windowStartTime.day,
      windowStartTime.hour,
      windowStartTime.minute,
      windowStartTime.second
    );
  }
  // console.log('Created: ', { row });
}

async function main() {
  await prisma.$connect();

  createRowAndScheduleNext(ROWS_TO_CREATE);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
