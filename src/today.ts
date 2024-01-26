import {getMenuForToday} from './util';
import {getConversations, publishMessage} from './slack';
import {OpenAi} from './openai';

export async function main() {
  console.log('Building dish of the day announcement');

  const menuText = await getMenuForToday();

  if (menuText.toLowerCase() === 'Lukket') {
    await announceClosed();
  } else {
    announceMenu(menuText);
  }
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
  const emojis = await ai.getEmojis(menuText);
  const translation = await ai.translateDaToEn(menuText);
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
    /* Pending Vercel pro license for more runtime
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
