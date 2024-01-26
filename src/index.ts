import express, {Express, Request, Response} from 'express';
import {main as fiveMin} from './fivemin';
import {main as today} from './today';
import {main as weekplan} from './weekplan';

const app: Express = express();

app.get('/', (req: Request, res: Response) => {
  res.send('{O.o}');
});

app.post('/api/fivemin', async (req: Request, res: Response) => {
  if (req.query.cron == 'true') {
    // Ensure DST corrected execution
    const cphDate = new Date().toLocaleString('en-US', {
      timeZone: 'Europe/Copenhagen',
    });
    if (new Date(cphDate).getHours() !== 10) {
      console.log('Skipping due to DST correction');
      res.send('Skipping due to DST correction');
      return;
    }
  }
  fiveMin();
  res.sendStatus(202);
});

app.post('/api/today', async (req: Request, res: Response) => {
  if (req.query.cron == 'true') {
    // Ensure DST corrected execution
    const cphDate = new Date().toLocaleString('en-US', {
      timeZone: 'Europe/Copenhagen',
    });
    if (new Date(cphDate).getHours() !== 9) {
      console.log('Skipping due to DST correction');
      res.send('Skipping due to DST correction');
      return;
    }
  }
  today();
  res.sendStatus(202);
});

app.post('/api/weekplan', async (req: Request, res: Response) => {
  if (req.query.cron == 'true') {
    // Ensure DST corrected execution
    const cphDate = new Date().toLocaleString('en-US', {
      timeZone: 'Europe/Copenhagen',
    });
    if (new Date(cphDate).getHours() !== 14) {
      console.log('Skipping due to DST correction');
      res.send('Skipping due to DST correction');
      return;
    }
  }
  weekplan();
  res.sendStatus(202);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
