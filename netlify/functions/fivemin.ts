import {main} from '../../src/fivemin';

export default async (req: Request) => {
  console.log('Received event:', req);
  await main();
  return new Response('OK');
};
