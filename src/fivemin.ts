const {convert} = require('html-to-text');

import {getConversations, publishMessage} from './slack';
import {getRandomGifLink} from './util';
import {getIssMenu} from './util';

export async function main() {
  console.log('Building five minute warning announcement');

  const menuText = await getTodaysMenu();

  if (menuText.toLowerCase() === 'Lukket') {
    console.log('Menu is closed, skipping announcement');
    return;
  }

  const randomGif = getRandomGifLink('FiveMin');

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Lunch serving starts in five minutes!',
      },
    },
    {
      type: 'image',
      title: {
        type: 'plain_text',
        text: '¯\\_(ツ)_/¯',
      },
      image_url: randomGif,
      alt_text: '{O.o}',
    },
  ];

  const conversations = await getConversations();
  for (const conversation of conversations) {
    await publishMessage(conversation, 'Frokost / Lunch : 5 min', blocks);
  }
}

async function getTodaysMenu(): Promise<string> {
  const html = await getIssMenu(1);
  if (html === '') {
    throw new Error('Failed to retrieve menu');
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
      throw new Error('Not a weekday');
  }

  return menuText;
}
