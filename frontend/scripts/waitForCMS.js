/* eslint-disable @typescript-eslint/no-var-requires */

// This script checks that the CMS is ready to serve the necessary
// data for Next.js builds. It will exit with an error code if
// the CMS cannot be reached within a set number of retries, causing
// a turbo pipeline including this script to abort

const axios = require('axios');

if (!process.env.CI) {
  console.log('Local build, loading dotenv files');
  // Load both .env and frontend/.env in case you
  // are running in the root or the frontend folder.
  const dotenv = require('dotenv');
  dotenv.config({ path: 'frontend/.env.local' });
  dotenv.config({ path: 'frontend/.env' });
  dotenv.config({ path: '.env.local' });
  dotenv.config({ path: '.env' });
}

const CMS_CHECK_ENDPOINT = `${process.env.CMS_URL}/templates`;

let attempts = 0;
const attemptLimit = 60;
const retryDelayMs = 500;

async function main() {
  console.log(`Checking for CMS availability at: ${CMS_CHECK_ENDPOINT}`);
  check();
}

async function check() {
  try {
    await axios({
      method: 'GET',
      url: CMS_CHECK_ENDPOINT,
      headers: {
        Authorization: `Bearer ${process.env.CMS_API_KEY}`,
      },
    });
    console.log('CMS ready');
    process.exit(0);
  } catch (e) {
    console.log('waiting for CMS...');
    attempts++;
    if (attempts < attemptLimit) {
      setTimeout(check, retryDelayMs);
    } else {
      console.log('Rety limit reached. CMS not available');
      process.exit(1);
    }
  }
}

main();
