import {Block, KnownBlock, WebClient} from '@slack/web-api';

const web = new WebClient(process.env.SLACK_TOKEN);

/** Gets the conversation IDs the bot affiliated with */
export async function getConversations(): Promise<string[]> {
  if (!process.env.SLACK_TOKEN) {
    return ['#test'];
  }
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

/**
 * Publishes a message to the given conversation ID.
 * @param id The conversation ID.
 * @param text The fallback text used for notifications.
 * @param blocks The message blocks.
 */
export async function publishMessage(
  id: string,
  text: string,
  blocks: (Block | KnownBlock)[]
) {
  const post = {
    channel: id,
    text: text,
    blocks: blocks,
  };

  if (!process.env.SLACK_TOKEN) {
    console.log('Not sending: ' + JSON.stringify(post, null, 2));
    return;
  }

  try {
    await web.chat.postMessage(post);

    console.log(`Sent ${text} to Slack`);
  } catch (error) {
    console.error(error);
  }
}
