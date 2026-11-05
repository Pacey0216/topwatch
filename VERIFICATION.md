# Verification — 4 November 2026

- All eleven inventory adapter tests pass, including both `form-upload-order` and `watch-assistant-upload-order`, preservation through the popup's second normalization pass, exact SKU photo isolation, and explicitly empty galleries.
- Chrome and Playwright WebKit browser suites pass at 320, 390, 520, 521, 620, 900, 901 and 1440 px. Cards use centered, uncropped 3:4 image areas; desktop cards are narrower and taller than the saved square-card baseline. The catalog and featured carousel use four desktop, two tablet and one mobile column; no horizontal page overflow was observed.
- Existing 55-product fixtures still paginate 24/24/7 after filtering. Search, clearing, language switching, stock refresh, comparison, descriptions, private-price exclusion, and side-by-side Details/Inquire actions pass regression checks.
- Product overviews appear before variant selection. Exact selected-variant images, one/two/four-photo galleries, thumbnail selection, zoom navigation, empty-gallery handling, popup scrolling and close/focus behavior pass in both browser engines.
- Read-only live inventory checks load 40 products and preserve all 42 supplied variant photos. Real Drive photos load using the existing thumbnail fallback; the sample image is 1200 by 1600 pixels. Live Batgirl Swiss and Japan selections display their distinct SKU-matched images. Real desktop and mobile popup images and 3:4 catalog frames were visually reviewed.
- Measured catalog columns at 1440/768/390 px are 4/2/1. Desktop cards are approximately 259.5 px wide, with 257.5 by 343.3 px image areas. The 24-product page size is unchanged.
- The contact panel shows `support@topwatch.trade`, and an intercepted click resolves to `mailto:support@topwatch.trade`. Messenger inquiries are also intercepted during tests; no email or Messenger messages were sent. Final live checks report no uncaught browser JavaScript errors.
- Website changes are saved locally. No production deployment, spreadsheet data edits, Drive permission changes, or backend modifications were performed. Phone layouts were simulated in browsers rather than checked on physical devices.

Evidence: `verification/browser-results.txt`, `verification/nov04-live-images-results.json`, and `verification/nov04-live-*.png`. Run `npm test`, `npm run test:browser`, and `node tests/live-images.cjs` with the local server at port 4180. Browser tooling needs Playwright and the appropriate `BROWSER_PATH`.

## Earlier verification — 2 November 2026

- Ten inventory adapter tests passed: restored descriptions and public specifications without prices or technical fields; reordered named headers; blank IDs; exact name/reference relationships; ambiguity rejection; explicit ID/reference conflict rejection; correct SKU/stock; no fabricated grade/size combinations; visibility/active status; photo isolation; price/technical-field removal without mutating input.
- Chrome and Playwright WebKit rendered suites passed at 320, 390, 620, 900 and 1440 px. A 55-product fixture verified 24/24/7 pagination and four-column layouts without horizontal overflow.
- Restored Details and Inquire actions remain side by side. Before/after measurements at all five viewport widths confirm that card width and height are preserved within two pixels; column counts are unchanged.
- Product image and Details button popup entry was checked after filtering, paging and language changes, plus best-seller image entry. No initial click activates zoom.
- One-, two- and four-photo sets verified thumbnail-only switching, main-image-only zoom, conditional non-wrapping arrows, navigation reset, selection retention after closing, and parent-popup cleanup. Enlarged popup, internal scrolling, visible close control and catalog scroll restoration passed.
- Filipino headline and unchanged English headline remain. The short popup disclaimer is removed and the footer disclaimer remains. Original descriptions/public specifications are restored without price amounts, Type/URI rows or internal fields.
- Variant switching and inventory refresh retain exact SKU and internal variant availability, while the popup displays overall available product stock. Messenger inquiries use the requested exact English/Filipino price question plus product name/SKU/grade/size and no amount. Details and Inquire buttons sit side by side on catalog and carousel cards; single-variant inquiries send directly and unresolved variants open the popup. Tests intercepted inquiry actions; no real messages were sent.
- Inline comparison supports two distinct SKUs, including different sizes of one model, independent model/grade/size controls, exact images/stock, duplicate and third-selection rejection, retained selections on collapse, and no independent image zoom.
- Special requests remain usable with empty search results. Best sellers use positive recorded sales and leave an explained empty state when no sales are recorded.
- Read-only live inventory check loaded ten products and confirmed selected SKU BATGIRL-40-JP with six available overall in the popup. Actual product photos and popup zoom worked; mobile catalog and desktop/mobile popup screenshots were visually inspected. No uncaught browser errors were observed.
- After user sign-in, the actual form editor and respondent view were inspected read-only: action-based section routing, exact variant dropdown labels, removed price questions, optional one-file Main Image, required up-to-five-file Live Images, required Box ID and the Raw response destination all match the updated lookup contract. No response was submitted; see INVENTORY-REVIEW.md.

Evidence: verification/browser-results.txt, verification/live-results.json, and verification/*.png. TEST fixture images are synthetic geometric placeholders; live screenshots use actual inventory photos.

Commands: npm test; npm run test:browser; node tests/live-smoke.cjs. Browser tooling requires Playwright, with BROWSER_PATH usable for a local Chrome executable. Tests used Windows Chrome/Playwright WebKit and simulated phone sizes, not physical devices. Production website files, Apps Script, Google Sheet data, form questions and private inventory calculations were not changed remotely. Website changes are saved locally in this project.




## November 5, 2026 — favicon, compact popup, uniform cards, inquiries and filters

Implemented locally in topwatch-main; no production deployment or remote data edits.

- Added 16/32/48 px ICO and PNG favicon assets, plus 180/192 px bookmark/touch icons derived from the supplied watch artwork. Existing site title and header logo remain unchanged.
- Reserved two title lines on catalog and featured cards; long titles retain full accessible text/title and full text in popup details. Original widths, 3:4 image areas and 4/2/1 responsive columns remain.
- Bounded the product dialog to its existing viewport limits. Photos and Product details tabs share the same area. Long descriptions/specifications use readable detail pages; large size sets use a native selector. Comparison, inquiry, variant selection, close, full-image display, thumbnails and zoom remain available without dialog scrolling. English and Filipino labels supported.
- All product inquiries (including comparison links) now use exactly `Hi! How much is this watch SKU <selected variant SKU> ?`, with the existing Messenger destination. Multi-variant cards still require a valid selection. Browser tests intercept outgoing links; no messages sent.
- Brand and grade choices constrain each other using available inventory. Compatible selections survive; unavailable brand/grade choices reset on refresh. Search combines with both filters before 24-item pagination. Zero-result search retains otherwise valid brand/grade choices.

Verification: 11 inventory-model tests passed. Existing full browser regression passed in Chrome and WebKit, including 1/2/4 images, zoom, comparison, selected variants, contact email and pagination. Dedicated UI checks cover seven viewports (320×568 through 1440×900, including 844×390 landscape), long titles/descriptions, uniform card heights, full detail-page access, keyboard tabs/Escape, large variant sets, both filter orders and inventory invalidation. Fixture tests include exactly 24, 25 and 23 matching results. See `verification/nov05-ui-results.txt` and `verification/browser-results.txt`.

Read-only live recheck: 40 products, 42 variants and 42 image references; actual Drive photos and grade-specific photos loaded; 4/2/1 column layouts and support@topwatch.trade remain. The first live attempt timed out on a Google Drive image; a retry passed through the existing thumbnail fallback, with zero uncaught page errors. No image-loading code changed. Evidence: `verification/nov05-live-images-results.json` and `verification/nov05-live-*.png`. Tests use simulated viewport sizes, not physical phones.

Commands: `npm test`, `npm run test:browser`, `npm run test:ui`, `node tests/live-images.cjs` (Playwright and local Chrome available via the bundled runtime).

## November 5, 2026 — popup correction: all information in one view

This revision supersedes the Photos/Product details tabs described above. The tabs, hidden description source, paginated details panel and popup title truncation are removed. Full titles and descriptions render immediately alongside the image, availability, selected SKU, variant selectors, comparison/inquiry actions and all existing public specifications. Desktop uses two balanced columns; portrait phones stack the image and information. Only the image height adapts to the remaining space; text stays readable and untruncated. The previous maximum width/height limits, dark-and-gold styling and existing controls remain.

Checks passed in Chrome and WebKit:
- All 40 current catalog products, including the shortest and longest descriptions, in English and Filipino: no popup scrollbar at 1440×900, 1280×720, 1024×768, 768×1024, 390×844, 375×667, 360×640 and 320×568.
- At the constrained 844×390 landscape viewport, 24/40 products fit; 16 need 5–31 pixels of vertical scrolling. Natural scrolling remains available so no information is clipped or removed. Arbitrarily longer future descriptions, additional specifications, enlarged text or smaller viewports can also require scrolling; there are no alternate panes or hidden-content shortcuts.
- Live photos and complete descriptions visually checked for Chronograph Royal Oak (matching the reference product), Silver Aquaracer (longest current description) and Overseas Dual Time. Zoom and the exact selected-SKU Messenger text passed with outgoing inquiry intercepted.
- Current live variants each have one photo. Separate synthetic four-photo galleries with real catalog text/variant combinations fit desktop and 390×844, and preserve thumbnail selection and zoom. Existing regression also verifies one/two/four-photo galleries, variant switching, comparison, filtering, 24-item pagination, unchanged cards, contact email and favicon.

Evidence: `verification/inline-popup-products.json` is a read-only public catalog snapshot; `verification/inline-popup-results.json` records every viewport/language fit result; `verification/inline-live-results.json` and `verification/inline-live-*.png` show actual photos. `verification/inline-ui-results.txt` and `verification/browser-results.txt` contain regression results. Browser tests use simulated viewport sizes, not physical phones.

Commands: `npm run test:popup`, `npm run test:ui`, `npm run test:browser`, `node tests/inline-popup-live.cjs`.
Changes saved locally; no deployment, remote data edits or messages sent.

## November 6, 2026 — compact, balanced popup

Popup-only refinement: desktop maximum width is now 1,040 CSS px (from 1,248), with 42/58 columns, a 28px gap, and a 500px maximum gallery height (from 600). Dialog height follows content. Full descriptions, titles and specifications remain visible without tabs or truncation. Size and grade options use compact, consistent widths instead of stretching. Comparison and Messenger actions are side by side, with the gold Messenger action retaining emphasis. Related content uses 10px gaps and section transitions use 16px spacing on desktop; tighter responsive spacing remains on phones.

Chrome and WebKit regression checks passed for variants, comparison, SKU-only Messenger inquiries (intercepted), thumbnails, zoom, price exclusion, catalog filters/pagination and unchanged card layouts. All 40 catalog texts fit without scrolling in both languages at the tested desktop/tablet sizes and portrait phones from 390×844 to 320×568. The existing short-landscape limitation remains at 844×390: 16 products require up to 31px of scrolling, preserving all text and controls. Four-image synthetic galleries with actual catalog text also passed desktop and mobile checks.

Updated visual-review screenshots use actual Air-King White and Silver Aquaracer photos and descriptions:
- verification/balanced-live-1440-air-king-white.png
- verification/balanced-live-1440-silver-aquaracer.png
- verification/balanced-live-390-air-king-white.png
- verification/balanced-live-390-silver-aquaracer.png
- verification/balanced-live-320-silver-aquaracer.png

Desktop screenshot measurements: dialog width 1040px; gallery height 500px; full image contained; no vertical overflow. Google Drive's browser embedding timed out twice during this run. For screenshot capture only, the test fetched the exact catalog image URLs directly and supplied their original bytes to the browser. No storefront image-loading behavior was changed. See verification/balanced-live-results.json for capture provenance and verification/balanced-popup-results.json for layout results.

Local changes only; no deployment, outgoing messages or remote inventory changes.

## November 6, 2026 — mobile gallery priority and native variant dropdowns

The mobile description is now hidden at widths up to 699px and in short phone-landscape layouts up to 900px wide/500px high. Desktop descriptions remain complete and visible. This is a responsive presentation change only; the description is still retained in the product data. The mobile gallery can use up to 380px of height instead of 240px, adapting to available space without cropping the photo. Actual 390×844 captures show 324px (Air-King) and 351px (Silver Aquaracer/Batgirl) galleries, up from 240px. The 1040px desktop popup and 500px desktop gallery limit remain.

Comparison and Messenger actions now stack in that order, with equal widths and at least 44px height on desktop/mobile. Size and Grade are native, explicitly labeled dropdowns in two columns. Single-option values auto-select; products with multiple sizes require a size before grade selection. Incompatible grade options are disabled. Changing size resets an incompatible grade and selects it automatically when only one grade remains. Clearing a required size clears grade/SKU and disables inquiry/comparison. Gallery updates follow the exact selected variant. Messenger messages retain the selected-SKU-only format.

Chrome/WebKit browser regression, UI regression and all 40 current catalog-text checks passed. Checks cover empty/single/multiple variants, clearing/incompatible selections, one/two/four-photo galleries, thumbnail selection, zoom, comparison variants, exact inquiry URLs (intercepted), stock refresh, desktop/mobile description visibility, stacked equal-width actions, unchanged cards/filters/pagination/contact/favicon. All 40 current products fit the tested portrait viewports down to 320×568. At 844×390 landscape, one product needs up to 21px vertical scrolling across both browsers/languages; no content is clipped.

Screenshots: verification/dropdown-live-1440-air-king-white.png, verification/dropdown-live-1440-silver-aquaracer.png, verification/dropdown-live-390-air-king-white.png, verification/dropdown-live-390-silver-aquaracer.png, verification/dropdown-live-390-gmt-master-ii-batgirl-.png, verification/dropdown-live-320-silver-aquaracer.png. Actual catalog photos were fetched directly for reliable screenshot capture using the existing optional test-only transport; storefront image loading is unchanged. Reports: verification/dropdown-live-results.json, verification/mobile-dropdown-results.json, verification/browser-results.txt and verification/inline-ui-results.txt.

No deployment, remote inventory edits or messages sent.
