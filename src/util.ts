import {readFileSync} from 'fs';
import {JSDOM} from 'jsdom';
const {convert} = require('html-to-text');

// Define types for our data structure
type Allergen = {
  id: number;
  name: string;
  translated_name: string;
};

type Dish = {
  name: string;
  translated_name: string;
  allergens: string[];
  translated_allergens: string[];
};

type Station = {
  id: number;
  name: string;
  image: string;
  dishes: Dish[];
};

export type DayMenu = {
  date: string;
  stations: Station[];
};

function stripHtml(htmlString: string): string {
  // Replace escaped characters (like double backslashes \\) with a single backslash
  return htmlString.replace(/\\+/g, '\\');
}

function extractUntilScriptEnd(htmlString: string): string {
  // Step 1: Find the index of the closing </script> tag
  const scriptEndIndex = htmlString.indexOf(';');

  // Step 2: If the </script> tag is found, slice the string up to that point
  if (scriptEndIndex !== -1) {
    return htmlString.slice(0, scriptEndIndex);
  }

  // Step 3: If </script> tag is not found, return the whole string
  return htmlString;
}

// Function to fetch and parse the JSON object from HTML
async function fetchJsonFromHtml(url: string): Promise<any> {
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);
  const bodyContent = dom.window.document.querySelector('body');

  if (bodyContent) {
    const content = bodyContent.textContent || '';

    // Look for a JSON object pattern in the content
    const match = content.match(/window.__remixContext = ({.*})/s);

    if (match && match[1]) {
      try {
        // Extract content before </script> and clean up the string
        const jsonString = stripHtml(extractUntilScriptEnd(match[1]));
        return JSON.parse(jsonString); // Parse cleaned JSON string
      } catch (error) {
        console.error('Error parsing JSON:', error);
        throw new Error('Invalid JSON data in HTML');
      }
    }
  }

  throw new Error('JSON data not found in HTML');
}

// Function to extract dishes from the parsed JSON
function extractDishes(data: any): DayMenu | null {
  const weekData =
    data.routeData['routes/banner/weekmenu/$location/index'].data.data;

  // Get today's date in the format "YYYY-MM-DD"
  const today = new Date().toISOString().split('T')[0];

  // Filter data for today's date
  const todayData = weekData.filter((item: any) => item.date === today);

  if (todayData.length === 0) {
    return null; // No data for today
  }

  const dayMenu: DayMenu = {
    date: today,
    stations: [],
  };

  const stationMap = new Map<number, Station>();

  todayData.forEach((item: any) => {
    const stationId = item.station_name?.parent_id?.id ?? item.station_name.id;
    let station = stationMap.get(stationId);
    if (!station) {
      station = {
        id: stationId,
        name:
          item.station_name?.parent_id?.station_name ??
          item.station_name.station_name,
        image:
          item.station_name?.parent_id?.station_image_1 ??
          item.station_name.station_image_1,
        dishes: [],
      };
      stationMap.set(stationId, station);
    }

    const dish: Dish = {
      name: item.recipe_id.menu_info,
      translated_name: item.recipe_id.menu_info_1,
      allergens: item.recipe_id.allergens_list.map(
        (a: {Allergens_id: Allergen}) => a.Allergens_id.name
      ),
      translated_allergens: item.recipe_id.allergens_list.map(
        (a: {Allergens_id: Allergen}) => a.Allergens_id.translated_name
      ),
    };

    station.dishes.push(dish);
  });

  dayMenu.stations = Array.from(stationMap.values());
  return dayMenu;
}

// Main function to fetch and extract dishes
export async function getTodaysDishes(url: string): Promise<DayMenu | null> {
  try {
    const jsonData = await fetchJsonFromHtml(url);
    return extractDishes(jsonData);
  } catch (error) {
    console.error('Error fetching or parsing data:', error);
    throw error;
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

export function removeIcons(text: string): string {
  return text.replace(/\[.*?\]/g, '');
}
