import {Block, KnownBlock, WebClient} from '@slack/web-api';

const web = new WebClient(process.env.SLACK_TOKEN);

export async function getConversations(): Promise<string[]> {
  const result = await web.conversations.list();
  const ids: string[] = [];

  if (result.channels === undefined) {
    return ids;
  }

  for (const channel of result.channels) {
    if (channel.id !== undefined && channel.is_member) {
      ids.push(channel.id);
    }
  }

  return ids;
}

export async function publishMessage(
  id: string,
  text: string,
  blocks: (Block | KnownBlock)[]
) {
  try {
    await web.chat.postMessage({
      channel: id,
      text: text,
      blocks: blocks,
    });

    console.log(`Sent ${text} to Slack`);
  } catch (error) {
    console.error(error);
  }
}
