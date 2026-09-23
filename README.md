# Live a Life

Public HTTPS play host for the Live a Life kids game.

Play: **https://agentlab-dev.github.io/live-a-life-web/**

GitHub Pages is served from branch `main`, folder `/` (root). No Actions deploy is required.

If that URL 404s, a repo owner must enable Pages at
https://github.com/AgentLab-dev/live-a-life-web/settings/pages
— Source = Deploy from a branch, Branch = `main`, folder = `/` (root).

This is a Vite 2D canvas game. Open on a phone or computer. No login. Tap **Play**, then walk: tap the ground, hold arrow keys / WASD, or use the on-screen D-pad on a phone. After Play, a tip explains how to **Add to Home Screen** (iPhone Share, or Android Install app) so it opens fullscreen like an app.

## What is here

- Level -1 house: paint the house, name the door, sit / eat / sleep, avatar colors, closet
- Level 0 city around the house: plaza, park, mural, computer people with canned lines, cafe / bakery / library, pretend jobs
- Park crossings: a friendly gate, garden bridge, stepping stones over a little creek, picnic delivery, sticker keepsakes, and neighbor cheers
- Town crossings: a hedge arch by Next Door, flower-bed pads by Friends, a library book cart to nudge, cafe hopscotch, mural ribbons, a bakery puddle plank, and a library-book share
- Weekday crossings: market crate steps, bakery flour-sack hops, park lily pads, a clothesline duck-under, pretend construction cones, and a postcard share at Friends
- Tuesday crossings: plaza fountain pads, sidewalk chalk zig-zag, a balloon-string arch, sandbox mound hops, a park swing duck-under, and a kind snack share from Honey Cafe
- Wednesday crossings: tire-stack hops by the shed, a log path over park-edge mud, a pretend bus-stop bench weave, a striped shop awning duck-under, a leafy garden trellis by Friends, and a kind flower share at the fountain bench
- Thursday crossings: tree-root hops by a park tree, a stepping-stump circle near the play area, a garden hose weave by Friends, a library porch rail, market basket stacks, and a kind leaf share at the plaza bench
- Friday crossings: a plaza chalk swirl, a sandbox rim balance by the east play lot, a picket-fence squeeze by the west yard, zigzag puddle stones south of the library, colorful mailbox hops on the east street, and a kind balloon share at a plaza bench
- Monday crossings: painted curb-stone hops by the west yard, a plaza planter-pot weave, a paper-lantern duck-under east of Honey Cafe, zigzag sidewalk boards by the library, spotted toadstool hops on the south-east lawn, and a kind pinwheel share from Friends to a cafe-south bench
- Tuesday town play: paint-can hops east of Honey Cafe, a kite-string weave on the south-east lawn, birdbath pads on the south-west lawn, a garden-gate squeeze by the shed, a pretend lemonade-stand duck-under north of Honey Cafe, and a kind bubble-wand share from the park to a plaza bench
- Wednesday town play: rainbow chalk-arc hops on the sidewalk, a watering-can weave by the Friends garden, a tea-towel laundry-umbrella duck-under on the south-west lawn, a picnic-cooler squeeze west of the park, mud-stone hops on the park's south edge, and a kind friendship-bracelet share at a mural-south bench
- Thursday town play: stepping-stone hops on the south-east lawn, a low-hedge duck-under east of Honey Cafe, laundry-line sock tip-toes by Friends, sandbox dig pads on the south-west lawn, leaf-pile jumps on the north-east lawn, and a kind-sticker share at a library-south bench
- Friday town play: hopscotch-pad hops on the west sidewalk, a jump-rope duck-under on the south-west lawn, a flower-box weave on the north-east lawn, a pool-noodle squeeze on the south-east lawn, tiny scooter-ramp hops south of the park, and a kind paper-airplane share at an east-lawn bench
- Monday town play: a low wooden balance-beam hop on the north-east lawn, tire-swing path pads just south of that beam, a coiled garden-hose step-over east of Honey Cafe, sidewalk chalk-arrow hops on the south-west lawn, picnic-blanket corner hops on the south-east lawn, and a kind seashell share from the main sidewalk to a south-lawn bench
- Tuesday town play: colorful hula-hoop hops on the north-west lawn beside the house, a wagon-wheel weave east of Friends, a cardboard-box tunnel squeeze on the south-west lawn, an umbrella duck-under on the north-east lawn, soft beach-ball hops south of the park, and a kind crayon share from the main sidewalk to a west-yard bench
- Wednesday town play: trampoline bounce pads on the north-west lawn beside the house, a bike-rack weave east of Honey Cafe, a picnic-table duck-under on the south-east lawn, a garden-gnome tip-toe path on the south-west lawn, sidewalk chalk-circle hops on the west sidewalk, and a kind ribbon share from Friends to a plaza bench
- USA geography play: a cartoon USA map with all 50 states plus D.C., capitals labeled as "Austin, Texas", a state-wide map to visit, and hops from capital to capital (the jumper is a teal letter I)
- Drawn in the original 2D kid-and-house style. No 3D, no chat, no money, no cars, no multiplayer

## Local

```bash
npm install
npm test
npm run dev
```

`npm run build` writes the GitHub Pages files to the repo root (`index.html` and `assets/`) with `base: ./`.
