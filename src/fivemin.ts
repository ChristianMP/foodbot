import {getConversations, publishMessage} from './slack';
import {getRandomGifLink} from './util';

export async function main() {
  console.log('Building five minute warning announcement');

  // TODO: Check for closed after converting to FoodPlace

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
