import {main} from '../../src/today';

export default async (req: Request) => {
  console.log('Received event:', req);
  await main();
  return new Response('OK');
};
