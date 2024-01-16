import {main} from '../../src/fivemin';

export default async (req: Request) => {
  console.log('Received event:', req);

  // Ensure DST corrected execution
  const cphDate = new Date().toLocaleString('en-US', {
    timeZone: 'Europe/Copenhagen',
  });
  if (new Date(cphDate).getHours() !== 10) {
    console.log('Skipping due to DST correction');
  } else {
    await main();
  }

  return new Response('OK');
};
