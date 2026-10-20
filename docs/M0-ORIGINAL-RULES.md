# MI-50 M0: original rules contract

Reference: handmade cardboard 50-square game photographed by its creators
(Felix and Mirana). The reference photo was supplied privately and has **not**
been published in this repository.

## Physical-game identity (preserve for the mobile version)

- 50 paper-numbered spaces over five serpentine rows of ten on cardboard.\n  The paper board starts at the bottom-left and reaches 50 at the top-right.
- Cut-paper decorations and a prominent handmade circular number spinner.
- A race among family members, not a worksheet first.
- The digital prototype describes a **six-sided dice**, while the photo suggests
  a hand-built spinner. For M0 the dice range stays **1–6**; spinner numbers
  and whether it was used instead of dice need creator confirmation.
- The photograph is not definitive evidence for small handwritten effects.
  The existing `mi50_game_design_doc.md` and `SpecialSquares.ts` are the
  baseline for the restored *digital* rule set.

## Frozen digital rule set for M0

- Local pass-and-play, 2–4 players, starting at 0.
- Exact arrival on square 50 wins. All overshooting forward movement is
  cancelled instead of bouncing.
- On a die roll, move and resolve the square landed on. Forced moves may
  trigger another square in the same turn. Each square can resolve only once
  within that chain, preventing a loop.
- Re-roll squares 2, 9, 14, 38: another turn for the same player.
- Skip-turn squares 3, 7, 42: skip the next scheduled turn once.
- Square 4: return to square 0.
- Trivia squares 5, 25, 45: correct = continue normally; incorrect = miss
  one future turn. Question generation is injected for reproducible tests.
- Stars on 6, 26, 39: collect 3 to queue one additional roll.
- Move effects 8/16 = +4, 10 = -4, 34 = -5, 35 = +5.
- Speed on 12/30: next legal die move receives +2. Boost is retained if
  the die+boost would overshoot 50.
- Shield on 18/37: absorbs and consumes on one negative square effect,\n  including the severe backward teleports from 40 and 47.
- Square 21: after reaching it, advance **2 times the last die number**;
  22 advances 3 times; 23 retreats by the number.
- Square 32: on the NEXT turn spent there, a die value of 4 is required
  to leave. Other rolls consume that turn.
- 40 jumps to 13 and 47 jumps to 27.
- Steal (19): the next other player's die result moves the owner instead
  of the roller. Mirror (28): the next other player's die result moves
  both. Copied movement does not trigger further square effects, to avoid
  two simultaneous trivia challenges.
- A bonus roll belongs to its original owner and is consumed by the next
  completed turn. Pending steal/mirror waits until a DIFFERENT player rolls.

## Explicit provisional interpretations

These were under-specified in the paper photo or earlier docs and should
be tested with the creators rather than assumed to be definitive:

1. Steal versus mirror: stole rolls deny movement to the other player;
   mirrored rolls allow movement to both. Effects are not retriggered on
   echo moves.
2. Multiple chained special-square effects resolve, not just the first.
   Example: square 8 leads to 12, where a speed power-up is awarded.
3. A shield absorbs a penalty, including a negative teleport, but the player\n   stays on the affected square.
4. Landing on 32 does not block entry; the roll-4 restriction applies on
   the next die roll from that square.
5. Unspent stars persist; no new monetization, achievements or board themes.
6. Rolling 1–6 follows the digital specification until spinner values are
   confirmed. The screenshot alone is not proof of spinner sector values.

## Balancing candidates for M3, NOT changes in M0

- Early reset at square 4, severe setbacks at 40 and 47.
- Square 32 exact-4 wait: expected 6 attempts to leave, potentially
  frustrating without catch-up support.
- High event density: 31 of 50 squares contain configured effects.
- Whether exact-roll completion drags out the final minutes.
- Difference between immediate move effects and the spinner suspense.

Track match length, number of lead changes, % complete, delayed or skipped
turns per child, and second-match requests. Keep an original-rules preset so
player tests of potential improvements can be compared fairly.

## Engineering gate

The canonical runtime reducer lives in `src/game-logic/TurnRules.ts`,
called directly by `src/hooks/useGameState.ts`. The older helper methods
in `GameEngine.ts` remain temporarily for compatibility, but must not
create another independent turn implementation.

`npm test` bundles the TypeScript reducer for dependency-free Node assertions
and replays seeded full matches. `npm run build` checks the React prototype.
No native Flutter project, polished UI, Play upload or device qualification
is claimed in M0.
