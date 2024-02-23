const {convert} = require('html-to-text');

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

    return removeIcons(
      convert(response.data, {
        wordwrap: null,
      })
    );
  } catch (err) {
    throw new Error('Failed to retrieve ISS menu');
  }
}

export async function getMenuForToday(): Promise<string> {
  const text = await getIssMenu(1);
  const now = new Date().getDay();
  let menuText: string;
  switch (now) {
    case 1:
      menuText = text
        .substring(text.indexOf('Mandag') + 6, text.indexOf('Tirsdag'))
        .trim();
      break;
    case 2:
      menuText = text
        .substring(text.indexOf('Tirsdag') + 7, text.indexOf('Onsdag'))
        .trim();
      break;
    case 3:
      menuText = text
        .substring(text.indexOf('Onsdag') + 6, text.indexOf('Torsdag'))
        .trim();
      break;
    case 4:
      menuText = text
        .substring(text.indexOf('Torsdag') + 7, text.indexOf('Fredag'))
        .trim();
      break;
    case 5:
      menuText = text
        .substring(text.indexOf('Fredag') + 6, text.indexOf('-------'))
        .trim();
      break;
    default:
      throw new Error('Not a weekday');
  }

  return menuText;
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

export function removeIcons(text: string): string {
  return text.replace(/\[.*?\]/g, '');
}
