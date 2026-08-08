# Top Watch 102 storefront

## Current setup
- Uses the shared `Top Watch 102 + Master Pogi Inventory` Google Sheet.
- The storefront is prepared for the shared Apps Script inventory API.
- Sample inventory is disabled.
- Only products with stock greater than 0 are intended to appear.
- `Website Visibility = No` hides a product even when stock exists.
- Filipino/Taglish is the default interface with an English toggle.

## Shared inventory
The live catalog source is the `Products` tab:

https://docs.google.com/spreadsheets/d/1ljK2RqkdA8E3iEpEutrhMnTurxGqXwY6Kb8yF2hW3S8/edit?gid=1807963011#gid=1807963011

Both Top Watch 102 and Master Pogi use the same stock pool.

## Remaining deployment step
Deploy the shared Apps Script inventory API, then paste the same `/exec` URL into `apiUrl` in this repository's `config.js` and in `Pacey0216/masterpogi-website/config.js`.

The Apps Script source and deployment instructions are stored in:

`Pacey0216/masterpogi-website/apps-script/`

## Language behavior
- Filipino/Taglish is the default interface.
- Visitors can switch to English using `FIL | ENG`.
- The browser remembers the selected language.
- Product names, brands, grades, prices, stock, descriptions, specifications, and watch details remain in English.
