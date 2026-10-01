# Edward's Career Quest 🎮

A playable résumé built as a side-scrolling platformer with HTML5 Canvas and
vanilla JavaScript. Travel through chapters of my education and work, collect
skills from ?-blocks, squash software bugs, and face the final boss: **THE JOB**.

**[Play in your browser](https://edwardh-jedi.github.io/career-quest/)** ·
[CI](https://github.com/EdwardH-jedi/career-quest/actions/workflows/ci.yml)

## Run locally

There is no build step, package installation, or runtime dependency. Download
**Code → Download ZIP**, extract it, and open `index.html` in a modern browser.
Or clone the repository:

```bash
git clone https://github.com/EdwardH-jedi/career-quest.git
cd career-quest
# Open index.html in your browser
```

If you prefer a local HTTP server, run this from the repository directory:

```bash
python -m http.server 8080
# Open http://localhost:8080
```

## Controls

| Action | Keyboard |
|---|---|
| Move | `←` / `→` or `A` / `D` |
| Jump | `Space`, `↑`, or `W`; hold for a higher jump |
| Throw a skill | `X` or `J` |
| Start | `Enter` |
| Restart | `R` |

Touch controls are shown when the browser reports touch support.

## Gameplay

Hit ?-blocks to unlock 28 skills from my résumé, then throw Python, SQL, Docker,
Git, and other skills at the enemies. Defeating an enemy closes a bug ticket;
coins count as commits and lives are cups of coffee. Stomping works on ordinary
enemies too. QA is QA.

THE JOB chases you and throws rejection letters. It only takes damage from
thrown skills, with hits shown as requirement matches. Defeat it to unlock the
offer gate and reach the ending.

## The worlds (in résumé order)

| World | Place | Résumé chapter |
|-------|-------|----------------|
| 1-1 | Jeju Island (2017–2022) | St Johnsbury Academy Jeju, the Arduino contactless coffee machine capstone, Samsung Enterprise Competition Grand Prize |
| 1-2 | Seoul — SNU Research Lab (2021) | Materials Science & Engineering research internship at Seoul National University |
| 1-3 | University of Sydney (from 2022) | Currently studying Bachelor of Advanced Computing (Computer Science) — coursework and tooling skills drop from ?-blocks |
| 1-4 | Sensorway — Ecopro, Hungary (2025–2026) | Computer Vision & Field Deployment internship: ~750 sensors, Docker, data pipelines, live rollout |
| FINAL | **BOSS: THE JOB** | The graduate job hunt itself — a giant angry briefcase with an HP bar |

## The cast

- **API Bug** 🐞 — I triaged REST API defects at Sensorway
- **null ghost** 👻 — floats toward you like an unhandled exception
- **Rogue Container** 🐳 — a Docker whale that escaped orchestration
- **Wild Mandarin** 🍊 (Jeju) — hops; ticket closes as "peeled and shipped"
- **Unstable Sample** 🧪 (Seoul) — a bubbling beaker; "experiment now reproducible"
- **Drop Bear** 🐨 (Sydney) — naps mid-patrol ("z z"), then it doesn't; "dropped from the tree, not from prod"
- **Spicy Paprika** 🌶️ (Hungary) — fast and angry; "de-spiced: severity mild"
- **THE JOB** 💼 — the final boss; skills only
- **?-blocks** — pop out the 28 actual skills from my résumé
- **Coins** — commits, obviously
- **Lives** — cups of coffee
- **Final flag** — the graduate offer 🏁

## Architecture and repository map

The game runs entirely in the browser. `game.js` defines tile-based levels,
collision and combat rules, keyboard/touch input, procedural Canvas drawing,
Web Audio sound effects, and a `requestAnimationFrame` game loop. The current
implementation keeps these systems in one script.

| File | Purpose |
|---|---|
| `index.html` | Page layout, canvas, touch buttons, styling, and contact links |
| `game.js` | Levels, game state, physics, enemies, boss, rendering, and sound |
| `smoke-test.js` | Dependency-free Node.js map and assisted playthrough checks |
| `.github/workflows/ci.yml` | JavaScript syntax checks and headless smoke test |

## Testing and limitations

Use Node.js 22, matching CI:

```bash
node --check game.js
node --check smoke-test.js
node smoke-test.js
```

The smoke test stubs the DOM and Canvas, checks every level map for spawn/flag
positions, pit widths, and ?-block/skill parity, then drives a bot through the
four résumé worlds and boss stage to the win screen. It also checks projectile
combat.

The bot uses assistance: it replenishes lives, can inject a skill for the boss,
and nudges the player past stalls. This checks game-state progression; it does
not establish an unassisted human playthrough, difficulty balance, rendering or
audio quality, mobile usability, or accessibility. Those need browser-based
manual testing. CI is configured to run on pushes and pull requests; inspect the
run for the commit you are reviewing.

## Contact

Edward (Soon Hyun) Hwang — Sydney, NSW
[edwardhwang1223@gmail.com](mailto:edwardhwang1223@gmail.com) ·
[LinkedIn](https://linkedin.com/in/soon-hyun-hwang-7212a42b7) ·
[GitHub](https://github.com/EdwardH-jedi)

