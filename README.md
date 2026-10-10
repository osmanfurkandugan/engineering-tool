# Electrical Tool

Free electrical engineering calculators built with React, TypeScript, and Vite.

## Calculators

- Voltage drop
- Cable sizing
- Load current
- Three-phase short-circuit current estimate

## Development

```sh
npm install
npm run dev
```

Create a production build with:

```sh
npm run build
```

Run the calculation and registry tests with:

```sh
npm test
```

See [CALCULATION_ASSUMPTIONS.md](CALCULATION_ASSUMPTIONS.md) for current model scope and limitations.

Calculator metadata and route components are registered together in `src/calculators/registry.ts`. Each calculator keeps its UI and pure calculation engine in its own folder.

Netlify builds the app and publishes the `dist` directory. Client-side routes are redirected to the app entry point.