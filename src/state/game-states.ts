import { createSignal } from 'solid-js';

const livesLimit = 4;
export const [score, setScore] = createSignal<number>(0);
export const [highScore, setHighScore] = createSignal<number>(0);
export const [lives, setLives] = createSignal<number>(livesLimit);
export const [level, setLevel] = createSignal<number>(1);
const [maxLives, _setMaxLives] = createSignal<number>(livesLimit);

export const newGame = () => {
    setScore(0);
    setLives(livesLimit);
    setLevel(1);
};

export const increaseScore = (points: number) => {
    setScore(score() + points);
    if (score() > highScore()) {
        setHighScore(score());
    }
}

export { maxLives };