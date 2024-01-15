import {main} from '../../src/weekplan';

export default async (req: Request) => {
  console.log('Received event:', req);
  await main();
  return new Response('OK');
};
