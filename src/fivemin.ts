import {getConversations, publishMessage} from './slack';
import {getRandomGifLink} from './util';

export async function main() {
  console.log('Building five minute warning announcement');

  const randomGif = await getRandomGifLink('FiveMin');

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

if (require.main === module) {
  /* eslint no-process-exit: "off" */
  main().then(
    () => process.exit(0),
    err => {
      console.error(err);
      process.exit(1);
    }
  );
}
