import axios from 'axios';
import {readFileSync} from 'fs';

export async function getIssMenu(page: number): Promise<string> {
  try {
    const response = await axios.get('https://issmenuplan.dk/Kundelink', {
      params: {
        GUID: process.env.ISS_KUNDELINK,
        Side: page,
      },
    });

    return response.data;
  } catch (err) {
    throw new Error('Failed to retrieve ISS menu');
  }
}

/**
 * Returns a random gif link from the giphys.md file based on the Slack emoji.
 * @param type The Slack emoji to be used as a theme.
 * @returns The gif link.
 */
export function getRandomGifLink(type: string): string {
  let theme = type.length > 0 ? type.toLocaleLowerCase() : 'notheme';
  if (theme === ':broccoli:') {
    theme = 'vegan';
  } else if (theme === ':deer:') {
    theme = 'venison';
  }

  const mdFile = readFileSync('resource/giphys.md').toString();
  const images = mdFile.split('\n');
  const filter = theme.replace(/[^a-z]/g, '');
  const matchedImages = [];
  for (const image of images) {
    if (image.toLowerCase().startsWith(`![${filter}`)) {
      matchedImages.push(
        image.substring(image.indexOf('(') + 1, image.indexOf(')'))
      );
    }
  }

  return matchedImages[Math.floor(Math.random() * matchedImages.length)];
}
