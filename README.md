# Ravus

Ravus is an approval-first AI marketing platform planned around one outcome: booked customers for local businesses. This repository contains a **local frontend preview**, a public website metadata scanner, and an early Python API scaffold.

## Run the frontend

```powershell
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
Use Node.js 24 or later for the local SQLite account store.

The frontend is a responsive, animated landing page built with Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI primitives, Motion, React Three Fiber, React Flow, react-konva, and TanStack Query. Its editorial interface uses Outfit headings, selected italic Playfair Display phrases, and Manrope body text. Black backgrounds, layered charcoal panels, white controls, and restrained motion frame the product demos; business photography stays in natural color.

## What the preview does

- Shows animated 3D artwork in the hero, a live 3D closing scene, and a scroll-driven journey from website import to booking.
- Presents three illustrated customer journeys in a scroll-driven phone showcase, with a subtle animated canvas backdrop and a swipeable sample gallery on smaller screens.
- Uses original, local visual assets for the hero, campaign previews, business gallery, and real-world booking moment.
- Lets you approve sample posts into a publishing calendar, compare creative revisions with a draggable split, switch creative versions, and inspect a campaign graph.
- Shows an illustrative campaign across a social post, landing page, and booking conversation, plus a photo gallery for dental, fitness, café, and real estate businesses.
- Lets you review a sample campaign, walk through a WhatsApp booking, and move suggested improvements through a review board.
- Shows a sample attribution dashboard from a local mock route.
- Scans a public website homepage for its title, description, headline, section headings, and theme color, then builds starter copy for two ad ideas and a landing page idea. The scan runs through a local Next.js route; the result remains in the browser session.
- Loops through a sample scan, brand, generation, and review story with Pip, the miniature Ravus pet. Pip appears in the viewport after scrolling, glides toward mouse movement on desktop, makes gentle random moves when idle, and can be repositioned by dragging or with the arrow keys. The scan dialog keeps its own side-to-side pet.
- Shows three local-business campaigns in an animated, tilted phone preview. Clicking or tapping the phone advances the sample; desktop hover adds a subtle 3D tilt.
- Shows two AI-generated dental campaign photos inside a responsive creative canvas. The current neutral-light pictures are saved locally under `apps/web/public/images/canvas-care-patient-neutral.webp` and `canvas-care-greeting-neutral.webp`.
- Cycles Ravus suggestions through proposed, in progress, and reviewed states with a reason and visual evidence for each sample card.
- Ends with a large Ravus wordmark and social platform labels. Their links are intentionally pending the official account URLs.
- Provides local sign-up, login, logout, and a protected account page. Passwords are hashed with scrypt, and sessions use HTTP-only cookies. Account records live in `apps/web/.data/ravus-auth.sqlite` and are ignored by Git.

The generated copy uses templates based on the scanned metadata. The visuals in the scan preview are illustrative; runtime AI image generation is not connected. The approval and WhatsApp examples are local UI state. They do not publish, spend, or send messages. The numbers and businesses on the page are sample data. The local account system is a prototype; product workspaces and saved campaigns are not connected to it yet.

## Checks

From `apps/web`, run `npm run typecheck`, `npm run lint`, and `npm run build`.

## Next stages

The FastAPI scaffold in `services/api` is not yet wired to the frontend.

