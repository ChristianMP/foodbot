import {Handler, HandlerEvent, HandlerContext} from '@netlify/functions';
import {main} from '../../src/weekplan';

const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  console.log('Received event:', event);

  // Ensure DST corrected execution
  const cphDate = new Date().toLocaleString('en-US', {
    timeZone: 'Europe/Copenhagen',
  });
  if (new Date(cphDate).getHours() !== 14) {
    console.log('Skipping due to DST correction');
  } else {
    await main();
  }

  return {
    statusCode: 200,
  };
};

export {handler};