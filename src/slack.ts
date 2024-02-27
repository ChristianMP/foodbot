import {Block, KnownBlock, WebClient} from '@slack/web-api';

const web = new WebClient(process.env.SLACK_TOKEN);

/** Gets the conversation IDs the bot affiliated with */
export async function getConversations(): Promise<string[]> {
  const args = {
    exclude_archived: true,
    types: 'public_channel, private_channel',
  };
  const result = await web.conversations.list(args);
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
