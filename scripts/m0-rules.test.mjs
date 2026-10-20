import assert from 'node:assert/strict';
import { build } from 'esbuild';

// Bundle the TypeScript reducer and its dependencies in memory. No test
// dependencies and no generated files are needed.
const bundled = await build({
  entryPoints: ['src/game-logic/TurnRules.ts'],
  bundle: true, platform: 'node', format: 'esm', write: false, logLevel: 'silent',
});
const url = 'data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64');
const { createGame, emptyGame, applyRoll, spendStars, answerQuestion } = await import(url);

const players = [
  { id: 0, name: 'Mira', color: 'red', character: 0, skipNextTurn: false },
  { id: 1, name: 'Felix', color: 'blue', character: 1, skipNextTurn: false },
];
const question = () => ({ question: '2+2?', answer: 4, num1: 2, num2: 2, operation: '+', difficulty: 'easy' });
let passes = 0;
const test = (name, run) => {
  try {
    run();
    console.log('PASS', name);
    passes++;
  } catch (error) {
    console.error('FAIL', name);
    throw error;
  }
};
const land = (square, roll = 1) => {
  const state = createGame(players);
  state.playerPositions[0] = square - roll;
  return applyRoll(state, roll, question);
};
test('fresh 2-4 player setup and distinct players', () => {
  assert.equal(createGame(players).playerPositions[0], 0);
  assert.equal(emptyGame().gamePhase, 'setup');
  assert.throws(() => createGame(players.slice(0, 1)));
});
test('roll bounds and no mutation of prior state', () => {
  const state = createGame(players);
  assert.throws(() => applyRoll(state, 7));
  assert.equal(applyRoll(state, 3).playerPositions[0], 3);
  assert.equal(state.playerPositions[0], 0);
});
test('square 2 adds an immediate extra turn', () => {
  const state = land(2);
  assert.equal(state.currentPlayerIndex, 0);
  assert.equal(state.bonusRolls[0], 0);
});
test('square 3 or 7 penalties affect the next turn only', () => {
  for (const square of [3, 7]) {
    const state = land(square);
    assert.equal(state.players[0].skipNextTurn, true);
    const after = applyRoll(state, 1, question);
    assert.equal(after.players[0].skipNextTurn, false);
    assert.equal(after.currentPlayerIndex, 1);
  }
});
test('square 4 restarts; square 40 and 47 teleport', () => {
  assert.equal(land(4).playerPositions[0], 0);
  assert.equal(land(40).playerPositions[0], 13);
  assert.equal(land(47).playerPositions[0], 27);
});
test('math challenge correct and incorrect resolution', () => {
  for (const square of [5, 25, 45]) {
    const state = land(square);
    assert.equal(state.gamePhase, 'trivia');
    assert.equal(state.triviaPlayer, 0);
    const correct = answerQuestion(state, '4');
    assert.equal(correct.gamePhase, 'playing');
    assert.equal(correct.currentPlayerIndex, 1);
    assert.equal(correct.players[0].skipNextTurn, false);
    const wrong = answerQuestion(state, '5');
    assert.equal(wrong.players[0].skipNextTurn, true);
  }
});
test('stars collected at 6, 26, 39', () => {
  for (const square of [6, 26, 39]) assert.equal(land(square).playerPowerUps[0].stars, 1);
});
test('square 8 chains into square 12 speed boost', () => {
  const state = land(8);
  assert.equal(state.playerPositions[0], 12);
  assert.equal(state.playerPowerUps[0].speedBoost, true);
});
test('square 10 back to 6 gains a star', () => {
  const state = land(10);
  assert.equal(state.playerPositions[0], 6);
  assert.equal(state.playerPowerUps[0].stars, 1);
});
test('square 9, 14 and 38 reroll', () => {
  for (const square of [9, 14, 38]) assert.equal(land(square).currentPlayerIndex, 0);
});
test('square 16 advances 4; square 34 retreats 5', () => {
  assert.equal(land(16).playerPositions[0], 20);
  assert.equal(land(34).playerPositions[0], 29);
});
test('square 35 advances five then chains through 40 to 13', () => {
  assert.equal(land(35).playerPositions[0], 13);
});
test('square 21 doubles roll, 22 triples, 23 reverses', () => {
  const doubled = land(21);
  assert.equal(doubled.playerPositions[0], 25); // 21->23->22->25
  assert.equal(doubled.gamePhase, 'trivia');
  assert.equal(land(22).playerPositions[0], 25);
  assert.equal(land(23).playerPositions[0], 25);
});
test('square 32 traps player until a four is rolled', () => {
  const start = createGame(players);
  start.playerPositions[0] = 32;
  assert.equal(applyRoll(start, 3, question).playerPositions[0], 32);
  assert.equal(applyRoll(start, 4, question).playerPositions[0], 36);
});
test('speed boost consumes on success but not overshoot', () => {
  const start = createGame(players);
  start.playerPowerUps[0].speedBoost = true;
  assert.equal(applyRoll(start, 3, question).playerPositions[0], 5);
  const near = createGame(players);
  near.playerPositions[0] = 49;
  near.playerPowerUps[0].speedBoost = true;
  assert.equal(applyRoll(near, 1, question).playerPowerUps[0].speedBoost, true);
});
test('shield blocks negative landing and is consumed', () => {
  const start = createGame(players);
  start.playerPositions[0] = 3;
  start.playerPowerUps[0].shield = true;
  const state = applyRoll(start, 1, question);
  assert.equal(state.playerPositions[0], 4);
  assert.equal(state.playerPowerUps[0].shield, false);
});
test('square 18 and 37 award shield, 12 and 30 grant speed', () => {
  for (const square of [18, 37]) assert.equal(land(square).playerPowerUps[0].shield, true);
  for (const square of [12, 30]) assert.equal(land(square).playerPowerUps[0].speedBoost, true);
});
test('square 19 steals next opponent die, square 28 mirrors it', () => {
  let stolen = land(19);
  assert.equal(stolen.waitingForNextPlayer?.type, 'steal');
  stolen = applyRoll(stolen, 3, question);
  assert.equal(stolen.playerPositions[0], 22);
  assert.equal(stolen.playerPositions[1], 0);
  let mirrored = land(28);
  assert.equal(mirrored.waitingForNextPlayer?.type, 'mirror');
  mirrored = applyRoll(mirrored, 3, question);
  assert.equal(mirrored.playerPositions[0], 31);
  assert.equal(mirrored.playerPositions[1], 3);
});
test('three stars earn one actual extra turn', () => {
  let state = createGame(players);
  state.playerPowerUps[0].stars = 3;
  state = spendStars(state);
  assert.equal(state.playerPowerUps[0].stars, 0);
  assert.equal(state.bonusRolls[0], 1);
  state = applyRoll(state, 1, question);
  assert.equal(state.currentPlayerIndex, 0);
  assert.equal(state.bonusRolls[0], 0);
  state = applyRoll(state, 1, question); // lands on roll-again square 2
  assert.equal(state.currentPlayerIndex, 0);
});
test('exact 50 wins, overshoot does not move', () => {
  const state = createGame(players);
  state.playerPositions[0] = 49;
  assert.equal(applyRoll(state, 1, question).winner, 0);
  const overshoot = applyRoll(state, 6, question);
  assert.equal(overshoot.playerPositions[0], 49);
  assert.equal(overshoot.gamePhase, 'playing');
});
test('100 seeded two-player games terminate and can replay exactly', () => {
  const simulate = seed => {
    let state = createGame(players);
    let steps = 0;
    let random = seed;
    while (state.gamePhase !== 'ended' && steps < 5000) {
      random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
      const roll = 1 + (random % 6);
      state = state.gamePhase === 'trivia'
        ? answerQuestion(state, '4')
        : applyRoll(state, roll, question);
      steps++;
    }
    assert.equal(state.gamePhase, 'ended', `seed ${seed} stuck after ${steps} steps`);
    return [state.winner, steps];
  };
  for (let seed = 1; seed <= 100; seed++) assert.deepEqual(simulate(seed), simulate(seed));
});
console.log(`M0 rules: ${passes} checks passed`);
