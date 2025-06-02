import { setup, raise, emit } from 'xstate';
import { newGame, lives } from '../../state/game-states';

export const gameStateMachine = setup({
    actions: {
        startup: raise(() => {
            newGame();
            return { type: 'board.build' };
        }),
        checkLives: raise(() => {
            if (lives() <= 0) {
                return { type: 'game.end' };
            }
            return { type: 'ball.spawn' };
        }),
        buildBoard: emit({ type: 'startBuildBoard' }),
        ballSpawn: emit({ type: 'startBallSpawn' }),
        gameOver: emit({ type: 'game.over' }),
    }
})
.createMachine({
    id: 'gameState',
    initial: 'start',
    states: {
        start:{
            on: {
                'board.build': {
                    target: 'buildBoard'
                },
                'startup.complete': {
                    target: 'buildBoard'
                }
            },
            entry: 'startup'
            
        },
        buildBoard: {
            on: {
                'ball.spawn':{
                    target: 'spawnBall'
                }
            },
            entry: 'buildBoard',
        },
        spawnBall: {
            on: {
                'game.play': {
                    target: 'gamePlay'
                }
            },
            entry: 'ballSpawn',
        },
        gamePlay: {
            on: {
                'board.clear': {
                    target: 'buildBoard'
                },
                'ball.gutter': {
                    target: 'checkGameOver'
                }
            }
        },
        checkGameOver: {
            on: {
                'game.end': {
                    target: 'gameOver'
                },
                'ball.spawn': {
                    target: 'spawnBall'
                }
            },
            entry: 'checkLives'
        },
        gameOver: {
            entry: 'gameOver',
        },
    }
});