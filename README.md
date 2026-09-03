# Live a Life

Public HTTPS play host for the Live a Life kids game.

Play: **https://agentlab-dev.github.io/live-a-life-web/**

GitHub Pages is served from branch `main`, folder `/` (root). No Actions deploy is required.

If that URL 404s, a repo owner must enable Pages at
https://github.com/AgentLab-dev/live-a-life-web/settings/pages
— Source = Deploy from a branch, Branch = `main`, folder = `/` (root).

This is a Vite 2D canvas game. Open on a phone. No login. Tap **Play**, then tap the ground to walk the city.

## What is here

- Level -1 house: paint the house, name the door, sit / eat / sleep, avatar colors, closet
- Level 0 city around the house: plaza, park, mural, computer people with canned lines, cafe / bakery / library, pretend jobs
- Drawn in the original 2D kid-and-house style. No 3D, no chat, no money, no cars, no multiplayer

## Local

```bash
npm install
npm test
npm run dev
```

`npm run build` writes the GitHub Pages files to the repo root (`index.html` and `assets/`) with `base: ./`.
