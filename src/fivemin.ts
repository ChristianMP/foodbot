import {getConversations, publishMessage} from './slack';
import {getRandomGifLink} from './util';
import {getMenuForToday} from './util';

export async function main() {
  console.log('Building five minute warning announcement');

  const menuText = await getMenuForToday();

  if (menuText.toLowerCase() === 'Lukket') {
    console.log('Cantine is closed, skipping announcement');
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
    await publishMessage(
      conversation,
      'Lunch serving starts in five minutes',
      blocks
    );
  }
}
