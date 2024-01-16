import {
  OpenAIClient,
  AzureKeyCredential,
  ChatRequestMessage,
} from '@azure/openai';

export class OpenAi {
  private endpoint: string;
  private azureApiKey: string;
  private chatDeployment: string;
  private dalleDeployment: string;
  private client: OpenAIClient;

  constructor() {
    if (
      !process.env.AZURE_OPENAI_ENDPOINT ||
      !process.env.AZURE_OPENAI_KEY ||
      !process.env.AZURE_OPENAI_CHAT_DEPLOYMENT ||
      !process.env.AZURE_OPENAI_DALLE_DEPLOYMENT
    ) {
      throw new Error('Missing Azure OpenAI configuration');
    }

    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    this.azureApiKey = process.env.AZURE_OPENAI_KEY;
    this.chatDeployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
    this.dalleDeployment = process.env.AZURE_OPENAI_DALLE_DEPLOYMENT;

    this.client = new OpenAIClient(
      this.endpoint,
      new AzureKeyCredential(this.azureApiKey)
    );
  }

  async getEmojis(menu: string): Promise<string> {
    if (menu === '' || menu.toLowerCase() === 'lukket') {
      return '';
    }

    const messages: ChatRequestMessage[] = [
      {
        role: 'system',
        content:
          'You are an AI assistant identifying the main raw ingredients in dishes, replying ONLY with Slack emojis',
      },
      {
        role: 'user',
        content:
          'Bagt laks m urtevente kartofler grøntsager og peberfrugt creme',
      },
      {
        role: 'system',
        content: ':fish::herb::potato::broccoli::bell_pepper:',
      },
      {
        role: 'user',
        content: menu,
      },
    ];

    const reply = await this.getChat(messages);

    // Remove duplicates by creating Set and back to Array
    return Array.from(new Set(reply.match(/:\w+:/g))).join(' ') as string;
  }

  async translateDaToEn(text: string) {
    if (text === '') {
      return '';
    } else if (text.toLowerCase() === 'Lukket') {
      return 'Closed';
    }

    const messages: ChatRequestMessage[] = [
      {
        role: 'system',
        content: 'You translate da to en',
      },
      {
        role: 'user',
        content: text,
      },
    ];

    const reply = await this.getChat(messages);

    return reply;
  }

  async getFunFact(menu: string): Promise<string> {
    const messages: ChatRequestMessage[] = [
      {
        role: 'system',
        content: 'You give interesting facts about dishes in English',
      },
      {
        role: 'user',
        content: menu,
      },
    ];

    const reply = await this.getChat(messages);

    return reply;
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const results = await this.client.getImages(
        this.dalleDeployment,
        prompt,
        {n: 1, size: '1024x1024'}
      );

      if (
        results.data.length === 0 ||
        results.data[0].url === undefined ||
        results.data[0].url === null
      ) {
        return new Promise((_resolve, reject) => {
          console.log('No result found');
          reject('No result found');
        });
      }

      return results.data[0].url;
    } catch (e) {
      console.error('Failed to generate image', e);
      return new Promise((_resolve, reject) => {
        reject('Failed to generate image');
      });
    }
  }

  private async getChat(messages: ChatRequestMessage[]): Promise<string> {
    try {
      const result = await this.client.getChatCompletions(
        this.chatDeployment,
        messages
      );

      if (
        result.choices.length === 0 ||
        result.choices[0].message === undefined ||
        result.choices[0].message?.content === null
      ) {
        return new Promise((_resolve, reject) => {
          console.log('No result found');
          reject('No result found');
        });
      }

      return result.choices[0].message?.content;
    } catch (e) {
      console.error('Failed to get chat response', e);
      return new Promise((_resolve, reject) => {
        reject('Failed to get chat response');
      });
    }
  }
}
