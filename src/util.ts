import axios from 'axios';
import {readFileSync} from 'fs';
import {v4 as uuidv4} from 'uuid';

/**
 * Converts the PNG icon filename to a Slack emoji.
 * @param iconText The icon file path and name.
 * @returns The corrosponding Slack emoji.
 */
export function convertIcon(iconText: string): string {
  const icon = iconText
    .substring(iconText.lastIndexOf('/') + 1)
    .replace('.png', '')
    .slice(0, -1)
    .trim();
  switch (icon) {
    case 'Ko':
      return ':cow2:';
    case 'Kalv':
      return ':calf:';
    case 'Gris':
      return ':pig2:';
    case 'Kylling':
      return ':chicken:';
    case 'Fisk':
      return ':fish:';
    case 'Kalkun':
      return ':turkey:';
    case 'Vildt':
      return ':deer:';
    default:
      return ':broccoli:';
  }
}

/** Translates the given text from Danish to English. */
export async function translateDaToEn(text: string) {
  if (text === '') {
    return '';
  }

  axios.defaults.timeout = 3000;

  const endpoint = 'https://api.cognitive.microsofttranslator.com/translate';
  const region = 'northeurope';

  const config = {
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_KEY,
      'Ocp-Apim-Subscription-Region': region,
      'Content-type': 'application/json',
      'X-ClientTraceId': uuidv4().toString(),
    },
    params: {
      'api-version': '3.0',
      from: 'da',
      to: 'en',
    },
  };

  const body = [
    {
      text: text,
    },
  ];

  let result: string;

  try {
    const response = await axios.post(endpoint, body, config);

    result = response.data[0].translations[0].text;
  } catch (e) {
    console.error('Failed to translate text', e);
    result = '_Translation unavailable_';
  }

  return result;
}

/**
 * Converts the menu item to a menu object with converted icon and translated
 * text to be used for the Slack message.
 * @param text The menu item text.
 * @returns The menu object.
 */
export async function convertToMenuObj(text: string) {
  const iconText = text.substring(text.indexOf('['), text.indexOf(']') + 1);
  let cleanedText = text.replace(iconText, '').trim();

  if (cleanedText.length === 0) {
    cleanedText = 'Lukket';
  }

  cleanedText = cleanedText.replace('\n', '\n>');

  const icon = convertIcon(iconText);
  return {
    text: {
      da: cleanedText,
      en: await translateDaToEn(cleanedText),
    },
    icon: icon,
    attachment: getRandomGifLink(icon),
  };
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
    console.error(
      `Failed to retrieve ISS menu, GUID={${process.env.ISS_KUNDELINK}}, Side={${page}}`
    );
    return '';
  }
}
