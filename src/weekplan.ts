const {convert} = require('html-to-text');

import {convertToMenuObj, getIssMenu} from './util';
import {getConversations, publishMessage} from './slack';

export async function main() {
  console.log('Building weekplan announcement');

  const html = await getIssMenu(2);
  if (html === '') {
    return;
  }

  const text: string = convert(html, {
    wordwrap: null,
  });

  const weekNumber = text
    .substring(text.indexOf('Menuplan'), text.indexOf('Mandag'))
    .replace(/\D/g, '');

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

  const monday = await convertToMenuObj(mondayText);
  const tuesday = await convertToMenuObj(tuesdayText);
  const wednesday = await convertToMenuObj(wednesdayText);
  const thursday = await convertToMenuObj(thursdayText);
  const friday = await convertToMenuObj(fridayText);

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `Menu uge / week ${weekNumber}`,
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `>*Mandag / Monday ${monday.icon}*\n>:flag-dk: ${monday.text.da}\n>\n>:flag-gb: ${monday.text.en}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `>*Tirsdag / Tuesday ${tuesday.icon}*\n>:flag-dk: ${tuesday.text.da}\n>\n>:flag-gb: ${tuesday.text.en}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `>*Onsdag / Wednesday ${wednesday.icon}*\n>:flag-dk: ${wednesday.text.da}\n>\n>:flag-gb: ${wednesday.text.en}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `>*Torsdag / Thursday ${thursday.icon}*\n>:flag-dk: ${thursday.text.da}\n>\n>:flag-gb: ${thursday.text.en}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `>*Fredag / Friday ${friday.icon}*\n>:flag-dk: ${friday.text.da}\n>\n>:flag-gb: ${friday.text.en}`,
      },
    },
  ];

  const conversations = await getConversations();
  for (const conversation of conversations) {
    await publishMessage(conversation, `Menu uge / week ${weekNumber}`, blocks);
  }
}
