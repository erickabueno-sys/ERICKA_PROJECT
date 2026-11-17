# Habi Wear – Clothing Apparel Catalog

A responsive, frontend-only clothing catalog and shopping cart built for **CC211 – Application Development and Emerging Technologies**, Finals Laboratory Examination, A.Y. 2025-2026, Polytechnic College of Botolan.

**Student name:** _[Your full name]_  **Section:** _[Your section]_

## Task 1: Project definition
- **Title:** Habi Wear (*habi* means "weave" in Filipino)
- **Problem:** Small local clothing sellers need a simple way to show products and let shoppers compare, save and collect items before ordering.
- **Target users:** Students and young professionals in Zambales and Bataan who shop for everyday clothing online; small shop owners who want a catalog template.
- **Objectives:** (1) show a clear, searchable catalog; (2) let users save favorites and build a cart that persists; (3) validate checkout details with helpful feedback; (4) work well on phones, tablets and desktops.
- **Main features:** search, category filter, price filter, sort, wishlist, quick-view modal with size picker, cart with quantities and totals, promo code (`HABI10`), checkout form validation, localStorage persistence.
- **Pages:** `index.html` (home, categories, featured items, size guide, FAQ), `pages/shop.html` (catalog), `pages/cart.html` (cart and checkout).

## Technologies
HTML5, CSS3, JavaScript (ES6), Bootstrap 5.3.3 (CDN: navbar, modal, toast, accordion, forms, grid, table), Google Fonts (Bricolage Grotesque, Public Sans), localStorage.

## How to open and use
1. Download or clone the repository. Keep an internet connection for the Bootstrap and font CDN files.
2. Open `index.html` in a browser (double-click, or use VS Code Live Server).
3. Go to **Shop**. Search, filter, sort, tap the heart to save an item, or press **Choose size** to add to cart.
4. Open **Cart**, change quantities, try promo code `HABI10`, then fill in the checkout form. This is a **frontend demonstration**: no payment, login or order is processed.

## Structure
```
habi-wear/
├── index.html
├── pages/ (shop.html, cart.html)
├── assets/ css/style.css · js/products.js · js/script.js · images/ (SVG product art)
├── docs/screenshots/
├── README.md
└── PROMPT_LOG.md
```

## AI tools used and contributions
- **Claude (Anthropic):** generated the first version of the project structure, HTML pages, CSS, JavaScript, SVG product images and the draft of this documentation, from the prompts in `PROMPT_LOG.md`.
- _[Add any other AI tool you used and what it did.]_
- I am responsible for reading, testing and explaining all submitted code.

## Testing performed and corrections made
Checks completed while building (automated, no browser): all local `src`/`href` paths in the three pages resolve to existing files; `script.js` passes `node --check` for syntax.

**Complete this table in a browser before submitting** (record real results and fixes):

| Check | Result | Issue found / correction made |
|---|---|---|
| Navigation links on all 3 pages | _ | _ |
| Search, filter, sort, price slider, saved-only toggle | _ | _ |
| Quick view, add to cart, quantity +/−, remove, clear | _ | _ |
| Cart persists after refresh (localStorage) | _ | _ |
| Checkout: empty, invalid and valid inputs | _ | _ |
| Layout at ~375px, ~768px, ~1280px | _ | _ |
| No overlap or overflow of text/images | _ | _ |
| Browser console shows no errors | _ | _ |
| Keyboard Tab shows visible focus on all controls | _ | _ |

## Known limitations
- Frontend only: no real checkout, payments, accounts or inventory.
- Product images are illustrated SVG placeholders, not photographs.
- Cart and wishlist are stored per browser and are lost if site data is cleared.
- Needs internet for Bootstrap and Google Fonts (system fonts are used as a fallback).

## Credits
Bootstrap 5.3.3 (MIT), Google Fonts (Bricolage Grotesque, Public Sans; SIL OFL). Product illustrations were generated for this project. Product names and descriptions are fictional.
