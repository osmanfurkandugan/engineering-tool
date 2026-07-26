# Electrical Tool

Free, open electrical engineering calculators.

## Folder Structure

```
/project-folder
  index.html                     → Home page (lists all tools)
  /css
    style.css                    → Shared style used by ALL pages
  /calculators
    /voltage-drop
      index.html                 → Voltage drop calculator page
      script.js                  → Calculation logic (JavaScript)
    /cable-sizing                → (a similar folder is added here for each new tool)
```

## Adding a new calculator

1. Create a new folder under `calculators/` (e.g. `calculators/cable-sizing/`)
2. Add an `index.html` and `script.js` inside it (you can copy the files from the `voltage-drop` folder and modify them)
3. Keep the line `<link rel="stylesheet" href="../../css/style.css">` — that's where the shared style comes from
4. On the home page (`index.html`), remove the `disabled` class from the relevant `tool-card` and point its link to the new page

## Changing the shared style

Just edit `css/style.css` — the change automatically applies to ALL pages.
