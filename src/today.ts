import {convertToMenus, getIssMenu} from './util';
import {getConversations, publishMessage} from './slack';

export async function main() {
  console.log('Building dish of the day announcement');

  const html = await getIssMenu(1);
  if (html === '') {
    return;
  }

  const now = new Date().getDay();
  const menu = (await convertToMenus(html)).menus[now - 1];

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `Dagens ret / Dish of the day ${menu.icon}`,
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
        text: `>:flag-dk: ${menu.text.da}\n>\n>:flag-gb: ${menu.text.en}`,
      },
      accessory: {
        type: 'image',
        image_url: menu.attachment,
        alt_text: `${menu.icon}`,
      },
    },
  ];

  const conversations = await getConversations();
  for (const conversation of conversations) {
    await publishMessage(conversation, 'Dagens ret / Dish of the day', blocks);
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
