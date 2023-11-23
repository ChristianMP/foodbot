import {convertToMenus, getIssMenu} from './util';
import {getConversations, publishMessage} from './slack';

export async function main() {
  console.log('Building weekplan announcement');

  const html = await getIssMenu(2);
  if (html === '') {
    return;
  }

  const {
    menus: [monday, tuesday, wednesday, thursday, friday],
    weekNumber,
  } = await convertToMenus(html);

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
