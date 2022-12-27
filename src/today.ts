const {convert} = require('html-to-text');

import {convertToMenuObj, getIssMenu} from './util';
import {getConversations, publishMessage} from './slack';

export async function main() {
  console.log('Building dish of the day announcement');

  const html = await getIssMenu(1);
  if (html === '') {
    return;
  }

  const text: string = convert(html, {
    wordwrap: null,
  });

  const now = new Date().getDay();
  let menuText: string;
  switch (now) {
    case 1:
      menuText = text
        .substring(text.indexOf('Mandag') + 6, text.indexOf('Tirsdag'))
        .trim();
      break;
    case 2:
      menuText = text
        .substring(text.indexOf('Tirsdag') + 7, text.indexOf('Onsdag'))
        .trim();
      break;
    case 3:
      menuText = text
        .substring(text.indexOf('Onsdag') + 6, text.indexOf('Torsdag'))
        .trim();
      break;
    case 4:
      menuText = text
        .substring(text.indexOf('Torsdag') + 7, text.indexOf('Fredag'))
        .trim();
      break;
    case 5:
      menuText = text
        .substring(text.indexOf('Fredag') + 6, text.indexOf('-------'))
        .trim();
      break;
    default:
      console.log('Not a weekday - returning');
      return;
  }

  const menuObj = await convertToMenuObj(menuText);

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `Dagens ret / Dish of the day ${menuObj.icon}`,
        emoji: true,
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `>:flag-dk: ${menuObj.text.da}\n>\n>:flag-gb: ${menuObj.text.en}`,
      },
      accessory: {
        type: 'image',
        image_url: menuObj.attachment,
        alt_text: `${menuObj.icon}`,
      },
    },
  ];

  const conversations = await getConversations();
  for (const conversation of conversations) {
    await publishMessage(conversation, 'Dagens ret / Dish of the day', blocks);
  }
}
