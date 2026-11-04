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



