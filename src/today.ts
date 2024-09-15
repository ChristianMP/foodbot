import {DayMenu, getTodaysDishes} from './util';
import {getConversations, publishMessage} from './slack';

export async function main() {
  console.log('Building dish of the day announcement');

  if (!process.env.MENU_URL) {
    console.error('Missing MENU_URL environment variable');
    return;
  }

  const dishes = await getTodaysDishes(process.env.MENU_URL);

  // if (menuText.toLowerCase() === 'Lukket') {
  //   await announceClosed();
  // } else {
  //   announceMenu(menuText);
  // }

  await announceMenu(dishes);
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

async function announceMenu(dayMenu: DayMenu | null) {
  if (!dayMenu) {
    console.error('No data for today');
    return;
  }

  const blocks = createSlackBlocks(dayMenu);

  const conversations = await getConversations();
  for (const conversation of conversations) {
    await publishMessage(
      conversation,
      `Today's Menu - ${dayMenu.date}`,
      blocks
    );
  }
}

type SlackBlock = {
  type: string;
  [key: string]: any;
};

function createSlackBlocks(dayMenu: DayMenu): SlackBlock[] {
  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `Today's Menu - ${dayMenu.date}`,
        emoji: true,
      },
    },
    {
      type: 'divider',
    },
  ];

  dayMenu.stations.forEach((station, stationIndex) => {
    // Add station name as a section
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${station.name}*`,
      },
    });

    // Add dishes for this station
    station.dishes.forEach((dish, dishIndex) => {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `>${dish.translated_name}\n>_Allergens: ${
            dish.translated_allergens.length === 0
              ? 'None'
              : dish.translated_allergens.join(', ')
          }_`,
        },
      });

      // Add a divider if it's the last one in the station
      if (dishIndex === station.dishes.length - 1) {
        blocks.push({
          type: 'divider',
        });
      }
    });
  });

  return blocks;
}
