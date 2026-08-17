# takaiwebsite

An [Astro](https://docs.astro.build) site with React islands, Tailwind CSS, and a standalone Node server for deployment.

## Required tools

| Tool        | Version | Notes                                                                     |
| :---------- | :------ | :------------------------------------------------------------------------ |
| **Node.js** | `>= 24` | Enforced via `engines` in `package.json` — `pnpm install` fails if older. |
| **pnpm**    | `11.x`  | The only supported package manager; `pnpm-lock.yaml` is committed.        |

Everything else — Astro, TypeScript, ESLint, Prettier — is a project dependency and arrives with `pnpm install`. There are no global installs and no other required system packages.

### Editor setup

VS Code is recommended. On opening the project it will suggest workspace extensions to install.

## Getting started

```sh
pnpm install
pnpm dev
```

The dev server runs at `localhost:4321` with hot module reloading.

## Commands

Run from the project root.

| Command          | Action                                                              |
| :--------------- | :------------------------------------------------------------------ |
| `pnpm install`   | Install dependencies                                                |
| `pnpm dev`       | Start the dev server at `localhost:4321`                            |
| `pnpm check`     | Type-check `.astro`, `.ts`, and `.tsx` files (`astro check`)        |
| `pnpm lint`      | Lint with ESLint                                                    |
| `pnpm format`    | Format all files with Prettier                                      |
| `pnpm build`     | Type-check, then build to `./dist/`                                 |
| `pnpm start`     | Serve the built site from `./dist/server/entry.mjs`                 |
| `pnpm astro ...` | Run Astro CLI commands, e.g. `pnpm astro add`, `pnpm astro preview` |

`pnpm build` runs `astro check` first, so a type error fails the build.

## Project structure

```text
/
├── public/                 # served as-is at the site root
│   ├── favicon.ico
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro    # shared page shell
│   ├── pages/              # file-based routing
│   │   └── index.astro
│   └── styles/
│       └── global.css      # Tailwind entry point
├── astro.config.mjs
├── eslint.config.js
└── tsconfig.json
```

Files in `src/pages/` become routes. See the [project structure guide](https://docs.astro.build/en/basics/project-structure/).

## Writing components

`.astro` components render to HTML with no client-side JavaScript. React components live alongside them as `.tsx` files and ship JS only when you ask for it:

```astro
---
import Counter from "../components/Counter.tsx";
---

<Counter />
<!-- static HTML, no JS -->
<Counter client:load />
<!-- hydrated in the browser -->
```

Without a `client:*` directive a React component is rendered to static HTML at build time. Use `client:load`, `client:idle`, or `client:visible` only where you need interactivity. See [framework components](https://docs.astro.build/en/guides/framework-components/).

Styling is [Tailwind CSS v4](https://tailwindcss.com), wired in through the Vite plugin in `astro.config.mjs` and imported from `src/styles/global.css`. There is no `tailwind.config.js` — v4 is configured in CSS.

## Deployment

The site builds with the [Node adapter](https://docs.astro.build/en/guides/integrations-guide/node/) in `standalone` mode, producing a self-contained server rather than a folder of static files.

```sh
pnpm build
pnpm start
```

Pages are **prerendered at build time** by default, so the server returns static HTML. To render a route per request, opt in explicitly:

```astro
---
export const prerender = false;
---
```

## Learn more

- [Astro documentation](https://docs.astro.build)
- [Routing](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Styling and Tailwind](https://docs.astro.build/en/guides/styling/)
