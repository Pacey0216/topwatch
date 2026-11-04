# Inventory and image review — 4 November 2026

The linked spreadsheet was inspected read-only again through the Google Drive connector. The Products tab is still `gid=1807963011`; Products main-image links and Product Images rows agree with the exact Variant SKU, size and grade records. Current image rows include Inventory Assistant / Watch Assistant uploads.

The public API snapshot contains 40 available products and 42 variants, with one available photo per variant. All 42 variants now use `photoSource: watch-assistant-upload-order`. The old adapter accepted only `form-upload-order`, discarded these valid URLs, and consequently displayed empty popup galleries. The adapter now accepts both explicit upload sources and preserves that provenance through popup and comparison normalization. Unknown sources, unsafe URLs and ambiguous variant relationships remain excluded.

The product's main image is shown while variant choices are unresolved. Once a variant is selected, only that variant's supplied images are shown; an explicitly empty gallery never borrows a sibling variant's photo. The existing Drive thumbnail fallback successfully loads the supplied `uc?export=view&id=...` links. Sample live images are 1200 by 1600 pixels, so card and popup frames use the matching 3:4 portrait ratio with centered `contain` sizing.

The contact email comes from `config.js`, now `support@topwatch.trade`; the existing contact setup uses that value for both the visible address and `mailto:` target. No spreadsheet records, image sharing settings, inventory quantities, or backend configuration were changed.

## Earlier inventory and form review — 2 November 2026

Verified through the Google Drive connector:

Spreadsheet: https://docs.google.com/spreadsheets/d/1ljK2RqkdA8E3iEpEutrhMnTurxGqXwY6Kb8yF2hW3S8/edit

## Current sheet mapping

- Products headers: Product ID, Product Name, Brand, Primary Reference, Available Sizes, Japan Qty, Swiss Qty, Super C Qty, Total Stock, Price From, Stock Status, Website Visibility, Main Image Url, Onhand Image Url, Description, Featured, Last Updated, Size Override, Recorded Sales, Main Image File ID, Image Source.
- Variants headers: Variant SKU, Product ID, Product Name, Reference Code, Size, Grade, Opening Stock, Opening Unit Cost, Stock Qty, Average Unit Cost, Default Selling Price, Active, Last Updated, Box ID.
- Existing Products and Variants records include blank Product IDs. Current public API provides nested variant relationships; explicit ID/reference/name conflicts are rejected. Separate header-based tables require a unique exact name with compatible reference, a unique reference, or a matching explicit ID. There is no fuzzy matching or row-position join, and ambiguous identifiers/SKUs are excluded.
- Stock comes from available variant records. For example, the live Batgirl Japan 40 mm variant is BATGIRL-40-JP with four available, even though Products contains an older aggregate quantity.
- Product Images links form uploads by Variant SKU, size and grade, with upload ordering/provenance. The adapter accepts the public API's form-upload-order photos for each selected variant, including gaps and up to five photos; it never borrows another variant's photo.
- Price From still exists as a Products header. Private cost/default-price fields remain in Variants. The public adapter drops pricing fields; no Sheet values or calculations were changed.
- Settings identifies RESPONSE_SHEET_NAME as Raw and the form ID below. Raw includes both old and newer response columns, including historical price fields. Those historical columns do not prove the form's current questions.

## Form review — access verified after sign-in

Form: Master Pogi + Top Watch 102 Inventory Log
https://docs.google.com/forms/d/1mNkhN18CJ96PmhnEm4K5DJH6qsvJr9WSOWwJJ59ogfo/edit

The signed-in form editor and respondent view were inspected read-only on 2 November 2026. The earlier connector 403 is no longer a review blocker because browser access is available.

Verified action routing:
- What do you want to log? is required. Sale routes to section 2, Restock to section 3, Stock Correction to section 4, and Add New Product / Variant to section 5.
- Sale: Sale Variant, Quantity Sold, Store (Master Pogi / Top Watch 102), Sale Notes (optional).
- Restock Existing Variant: Restock Variant, Quantity Added, Restock Notes (optional).
- Stock Correction: Correction Variant, New Stock Qty, Correction Reason. Its description confirms that the quantity applies to the exact size/grade combination.
- Sale, Restock and Stock Correction sections finish with Submit form, rather than continuing into other action sections.

Verified Add New Product / Variant fields:
- Product Name: required; the description explicitly says to use the existing Product Name exactly when adding a size/grade.
- Brand (new products only): required in the current published form; choices include Richard Mille, Audemars Piguet, Patek Philippe, Rolex, Tag Heuer, Cartier, Omega, and Other.
- Reference Code (optional).
- Size: required, with examples 38 mm / 40 mm.
- Grade: required; Japan, Swiss, Super C.
- Opening Stock Qty: required.
- Main Image: optional, one file, maximum 10 MB.
- Live Images: required, up to five files, maximum 10 MB each.
- Box ID: required.
- Description (optional).

No selling-price question appears in the current form, including the Restock and Add New Product / Variant sections. Historical Raw price columns remain historical data and are not restored to the website.

The form's Responses > View in Sheets opened the verified inventory spreadsheet at gid 1069818176, confirming Raw as the actual response destination rather than relying only on Settings. The dropdown labels include exact SKU, model, size, grade and stock, consistent with the website's exact variant lookups.

The current website adapter already matches this structure: Products for model-level details, available variant records for SKU/grade/size/stock, and each variant's trusted upload photos (up to five supplied by the public API). Box ID remains an inventory field rather than a public technical detail. No additional lookup-code change was required after this review.

No form questions or settings were edited, and no response was submitted. The user's open draft response was left intact. Form submission processing itself was not tested through a live inventory-changing submission.
