const {convert} = require('html-to-text');

import {getIssMenu} from './util';
import {getConversations, publishMessage} from './slack';
import {OpenAi} from './openai';

export async function main() {
  console.log('Building dish of the day announcement');

  const menuText = await getTodaysMenu();

  if (menuText.toLowerCase() === 'Lukket') {
    await announceClosed();
  } else {
    announceMenu(menuText);
  }

  async function announceClosed() {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Dish of the day',
          emoji: true,
        },
      },
    ];

    const conversations = await getConversations();
    for (const conversation of conversations) {
      await publishMessage(conversation, 'The cantine is closed today', blocks);
    }
  }

  async function announceMenu(menuText: string) {
    const ai = new OpenAi();
    const cleanedMenuText = removeIcons(menuText);
    const emojis = await ai.getEmojis(menuText);
    const translation = await ai.translateDaToEn(cleanedMenuText);
    const funFact = await ai.getFunFact(translation);
    //const imageUrl = await ai.generateImage(translation);

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Dish of the day',
          emoji: true,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'plain_text',
            text: emojis,
            emoji: true,
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:flag-dk: ${menuText}\n\n:flag-gb: ${translation}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Fun fact:*\n${funFact}`.replace(/\n/g, '\n>'),
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '_Generated using gpt-35-turbo_',
          },
        ],
      },
      /* Pending migration or Netlify function runtime fix (max 10 secs)
      {
        type: "image",
        title: {
          type: "plain_text",
          text: ":robot_face: DALL·E 3 generated image",
          emoji: true
        },
        image_url: menuObj.attachment,
        alt_text: "marg"
      },
      {
        type: "context",
        elements: [
          {
            type: "plain_text",
            text: "Disclaimer: Generated image is not representative of how the cantine will serve the dish.",
            emoji: true
          }
        ]
      }
      */
    ];

    const conversations = await getConversations();
    for (const conversation of conversations) {
      await publishMessage(
        conversation,
        `Dish of the day: ${translation}`,
        blocks
      );
    }
  }
}

async function getTodaysMenu(): Promise<string> {
  const html = await getIssMenu(1);
  if (html === '') {
    throw new Error('Failed to retrieve menu');
  }

  const text: string = removeIcons(
    convert(html, {
      wordwrap: null,
    })
  );

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

function removeIcons(text: string): string {
  return text.replace(/\[.*?\]/g, '');
}
