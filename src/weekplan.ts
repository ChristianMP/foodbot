const {convert} = require('html-to-text');

import {getIssMenu} from './util';
import {getConversations, publishMessage} from './slack';
import {OpenAi} from './openai';

export async function main() {
  console.log('Building weekplan announcement');

  const html = await getIssMenu(2);
  if (html === '') {
    return;
  }

  const text: string = convert(html, {
    wordwrap: null,
  });

  let weekNumber;
  const weekNumberRgx = text.match(/[Uu]ge\s\d\d/g);
  if (weekNumberRgx === null) {
    weekNumber = 'unknown';
  } else {
    weekNumber = weekNumberRgx[0].replace(/\D/g, '');
  }

  const mondayText = text
    .substring(text.indexOf('Mandag') + 6, text.indexOf('Tirsdag'))
    .trim();
  const tuesdayText = text
    .substring(text.indexOf('Tirsdag') + 7, text.indexOf('Onsdag'))
    .trim();
  const wednesdayText = text
    .substring(text.indexOf('Onsdag') + 6, text.indexOf('Torsdag'))
    .trim();
  const thursdayText = text
    .substring(text.indexOf('Torsdag') + 7, text.indexOf('Fredag'))
    .trim();
  const fridayText = text
    .substring(text.indexOf('Fredag') + 6, text.indexOf('-------'))
    .trim();

  const ai = new OpenAi();
  const mondayEmojis = await ai.getEmojis(mondayText);
  const mondayTranslation = await ai.translateDaToEn(mondayText);
  const tuesdayEmojis = await ai.getEmojis(tuesdayText);
  const tuesdayTranslation = await ai.translateDaToEn(tuesdayText);
  const wednesdayEmojis = await ai.getEmojis(wednesdayText);
  const wednesdayTranslation = await ai.translateDaToEn(wednesdayText);
  const thursdayEmojis = await ai.getEmojis(thursdayText);
  const thursdayTranslation = await ai.translateDaToEn(thursdayText);
  const fridayEmojis = await ai.getEmojis(fridayText);
  const fridayTranslation = await ai.translateDaToEn(fridayText);

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `Menu week ${weekNumber}`,
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `>*Monday ${mondayEmojis}*\n>:flag-dk: ${mondayText}\n>\n>:flag-gb: ${mondayTranslation}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `>*Tuesday ${tuesdayEmojis}*\n>:flag-dk: ${tuesdayText}\n>\n>:flag-gb: ${tuesdayTranslation}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `>*Wednesday ${wednesdayEmojis}*\n>:flag-dk: ${wednesdayText}\n>\n>:flag-gb: ${wednesdayTranslation}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `>*Thursday ${thursdayEmojis}*\n>:flag-dk: ${thursdayText}\n>\n>:flag-gb: ${thursdayTranslation}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `>*Friday ${fridayEmojis}*\n>:flag-dk: ${fridayText}\n>\n>:flag-gb: ${fridayTranslation}`,
      },
    },
  ];

  const conversations = await getConversations();
  for (const conversation of conversations) {
    await publishMessage(conversation, `Lunch menu week ${weekNumber}`, blocks);
  }
}
