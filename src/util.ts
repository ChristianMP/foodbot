import axios from 'axios';
import {readFile} from 'fs';
import {v4 as uuidv4} from 'uuid';
import {promisify} from 'util';
import {getRandomValues} from 'crypto';
import {convert} from 'html-to-text';
import {basename} from 'path';

/**
 * The menu for a single day.
 */
interface DayMenu {
  text: {
    da: string;
    en: string;
  };
  icon: string;
  attachment: string;
}

/**
 * The menus for a week.
 */
interface WeekMenus {
  weekNumber: number;
  menus: [DayMenu, DayMenu, DayMenu, DayMenu, DayMenu];
}

/**
 * Converts the PNG icon filename to a Slack emoji.
 * @param iconText The icon file path and name.
 * @returns The corrosponding Slack emoji.
 */
export function convertIcon(iconText: string): string {
  const icon = basename(iconText, '.png').trim();
  switch (icon) {
    case 'Cow':
    case 'Ko':
      return ':cow2:';
    case 'Calf':
    case 'Kalv':
      return ':calf:';
    case 'Pig':
    case 'Gris':
      return ':pig2:';
    case 'Chicken':
    case 'Kylling':
      return ':chicken:';
    case 'Fish':
    case 'Fisk':
      return ':fish:';
    case 'Turkey':
    case 'Kalkun':
      return ':turkey:';
    default:
      return ':broccoli:';
  }
}

/** Translates the given text from Danish to English. */
export async function translateDaToEn(text: string) {
  if (text === '') {
    return '';
  } else if (!process.env.AZURE_KEY) {
    return 'Translation unavailable';
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
    console.error('Failed to translate text');
    result = '_Translation unavailable_';
  }

  return result;
}

/**
 * Converts the menu item to a combined menus object with converted icons and
 * translated text to be used for the Slack message.
 * @param html The menu item text.
 * @returns The menu object.
 */
export async function convertToMenus(html: string): Promise<WeekMenus> {
  const text: string = convert(html, {
    wordwrap: null,
  });

  return {
    weekNumber: Number(
      text
        .substring(text.indexOf('Menuplan'), text.indexOf('Mandag'))
        .replace(/\D/g, '')
    ),
    menus: await Promise.all([
      convertToMenuObj(
        text
          .substring(text.indexOf('Mandag') + 6, text.indexOf('Tirsdag'))
          .trim()
      ),
      convertToMenuObj(
        text
          .substring(text.indexOf('Tirsdag') + 7, text.indexOf('Onsdag'))
          .trim()
      ),
      convertToMenuObj(
        text
          .substring(text.indexOf('Onsdag') + 6, text.indexOf('Torsdag'))
          .trim()
      ),
      convertToMenuObj(
        text
          .substring(text.indexOf('Torsdag') + 7, text.indexOf('Fredag'))
          .trim()
      ),
      convertToMenuObj(
        text
          .substring(text.indexOf('Fredag') + 6, text.indexOf('-------'))
          .trim()
      ),
    ]),
  };
}

/**
 * Converts the menu item to a menu object with converted icon and translated
 * text to be used for the Slack message.
 * @param text The menu item text.
 * @returns The menu object.
 */
export async function convertToMenuObj(text: string): Promise<DayMenu> {
  const pattern = / *\[(.+)]/;
  const match = text.match(pattern);
  let cleanedText: string, iconText: string;

  if (match === null) {
    cleanedText = text ? text : 'Lukket';
    iconText = '';
  } else {
    cleanedText = text.substring(0, match.index);
    iconText = match[1];
  }

  const icon = convertIcon(iconText);

  return {
    text: {
      da: cleanedText,
      en: await translateDaToEn(cleanedText),
    },
    icon: icon,
    attachment: await getRandomGifLink(icon),
  };
}

/**
 * Obtain all gif links from the `giphys.md` file, as a mapping between Slack
 * emoji and gif links.
 */
export async function getAllGifLinks(): Promise<Map<string, string[]>> {
  const pattern = /!\[(.+)]\((.+)\)/;
  const buf = await promisify(readFile)('resource/giphys.md');

  return buf
    .toString()
    .split('\n')
    .filter(l => l.length > 0)
    .map(l => pattern.exec(l))
    .filter(m => m)
    .map(m => m!)
    .map(m => [m[1], m[2]] as [string, string])
    .reduce((map, [type, link]) => {
      const icon = convertIcon(type);
      const images = map.get(icon) ?? [];
      images.push(link);
      map.set(icon, images);
      return map;
    }, new Map<string, string[]>());
}

/**
 * Returns a random gif link from the giphys.md file based on the Slack emoji.
 * @param type The Slack emoji to be used as a theme.
 * @returns The gif link.
 */
export async function getRandomGifLink(type: string): Promise<string> {
  const theme = type.length > 0 ? type : 'Vegan';

  const imageMap = await getAllGifLinks();
  const choices = imageMap.get(theme) ?? [];
  const indices = new Uint16Array(1);

  getRandomValues(indices);

  return choices[indices[0] % choices.length];
}

/**
 * Retrieves the menu from the ISS website.
 * @param page The page number to retrieve.
 * @returns The menu as HTML.
 */
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
