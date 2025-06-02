import { Component, onMount } from 'solid-js';
import styles from './end-screen.module.scss';
import { Typography, Button } from '@suid/material';
import { score, highScore } from '../../state/game-states';
import { Route } from '../../types/routes';
import { setCurrentRoute, getBasePath } from '../../state/route-state';
import AudioControls from '../../components/audio-controls/audio-controls';
import { audioManager } from '../../state/audio-state';

const EndScreen: Component = () => {
    onMount(() => {
        audioManager.playMusic('endscreen');
    });

    return (
        <div class={styles.container} style={{ 'background-image': `url(${getBasePath()}images/endscreen.png)` }}>
            <div class={styles.content}>
                <Typography variant="h2" class={styles.title}>
                    {score() >= highScore() ? 'WELL DONE!' : 'GAME OVER'}
                </Typography>
                <Typography variant="h4" class={styles.score}>
                    Score: {score()}
                </Typography>
                <Typography variant="h4" class={styles.highScore}>
                    High Score: {highScore()}
                </Typography>
                <div class={styles.actions}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            audioManager.stopMusic();
                            setCurrentRoute(Route.Game);
                        }}
                    >
                        Play Again
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                            audioManager.stopMusic();
                            setCurrentRoute(Route.Menu);
                        }}
                    >
                        Main Menu
                    </Button>
                    </div>
                <AudioControls />
            </div>
        </div>
    );
}

export default EndScreen;