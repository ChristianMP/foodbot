[![Netlify Status](https://api.netlify.com/api/v1/badges/dde35cf9-8199-4b45-a4c0-f99fe0e1ae9c/deploy-status)](https://app.netlify.com/sites/sg-foodbot/deploys)
[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)

# foodbot

A bot for reading ISS food menus, translating the Danish menu text and posting it into Slack channels using pretty styling with icons and GIFs.

## Announcement types

The bot will do three different types of announcements:

### Dish of the day

![Dish of the day](/resource/dish_of_the_day.png)

### Five minute warning

![Five minute warning](/resource/five_min_warning.png)

### Weekplan

![Weekplan](/resource/weekplan.png)

## GIFs

The various GIFs used by the bot are stored in a markdown file in the resource folder. This file has a variety of GIFs listed under different sections indicating the type of protein or lack thereof.

## Contributing

When contributing to the project, remember to utilize linting and preferably do
```sh
npx run fix
```
before pushing your commits.

## Adding new GIFs

If you desire new GIFs to be used with the bot, simply append on to the list in the `giphys.md` file in the resource folder.

The file size (<4mb) will be automatically validated in the pipeline when creating a PR with your changes Much love to [danchr](https://github.com/danchr)
