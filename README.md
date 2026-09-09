# Edward's Career Quest 🎮

A Super Mario-style platformer that doubles as my résumé. Every world, enemy,
weapon, and collectible maps to something real from my background — and the
worlds follow my actual timeline.

**Play it:** open `index.html` in any browser — no build step, no dependencies,
pure HTML5 Canvas + vanilla JavaScript.

Download the repository with **Code → Download ZIP**, extract it, and open
`index.html`. Alternatively, serve the extracted directory with
`python -m http.server 8080` and open `http://localhost:8080`.

[Automated playthrough checks](https://github.com/EdwardH-jedi/soonpermario/actions/workflows/ci.yml)
run on pushes and pull requests. The automated bot uses scripted assistance;
its success verifies the game can reach its ending, not human playability,
mobile usability, or difficulty balance.

## The worlds (in résumé order)

| World | Place | Résumé chapter |
|-------|-------|----------------|
| 1-1 | Jeju Island (2017–2022) | St Johnsbury Academy Jeju, the Arduino contactless coffee machine capstone, Samsung Enterprise Competition Grand Prize |
| 1-2 | Seoul — SNU Research Lab (2021) | Materials Science & Engineering research internship at Seoul National University |
| 1-3 | University of Sydney (2022–2026) | Bachelor of Advanced Computing (Computer Science) — coursework and tooling skills drop from ?-blocks |
| 1-4 | Sensorway — Ecopro, Hungary (2025–2026) | Computer Vision & Field Deployment internship: ~750 sensors, Docker, data pipelines, live rollout |
| FINAL | **BOSS: THE JOB** | The graduate job hunt itself — a giant angry briefcase with an HP bar |

## Final boss: THE JOB

Every graduate's true final boss. THE JOB chases you, hops, and throws
**REJECT** letters. Stomping does nothing — it can **only be damaged by
throwing your skills at it** (each hit lands as `REQUIREMENT MET: PYTHON ✓`).
Drain its HP and the offer gate crumbles: `OFFER EXTENDED — GATE UNLOCKED!`

## Combat: throw your skills at the bugs

Hit a ?-block to unlock a real skill from my résumé (big banner, can't miss it).
Then press **X / J** to literally throw your skills — Python, SQL, Docker,
Git… — at the mobs. Every kill files and closes a ticket:

- `BUG-007 closed: could not reproduce`
- `BUG-012 NullPointerException handled`
- `BUG-019 docker stop → exit code 0`
- `BUG-023 fixed with PYTHON`

Stomping works too. QA is QA.

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

## Controls

- `← →` / `A D` — move
- `Space` / `↑` / `W` — jump (hold for higher jumps)
- `X` / `J` — throw a skill
- `R` — restart, `Enter` — start
- Touch controls appear automatically on mobile

## Testing

`node smoke-test.js` runs a headless verification: it stubs the DOM, validates
every level map (spawn, flag, pit widths, ?-block/skill parity), drives a
pit-aware bot through all four worlds, defeats THE JOB with thrown skills, and
confirms the win screen is reached.

## Contact

Edward (Soon Hyun) Hwang — Sydney, NSW
[edwardhwang1223@gmail.com](mailto:edwardhwang1223@gmail.com) ·
[LinkedIn](https://linkedin.com/in/soon-hyun-hwang-7212a42b7) ·
[GitHub](https://github.com/EdwardH-jedi)
