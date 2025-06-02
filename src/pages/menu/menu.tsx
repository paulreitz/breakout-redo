import { Component, onMount } from 'solid-js';
import { Button, Typography } from '@suid/material';
import { setCurrentRoute, getBasePath } from '../../state/route-state';
import { Route } from '../../types/routes';
import { audioManager } from '../../state/audio-state';
import styles from './menu.module.scss';

import AudioControls from '../../components/audio-controls/audio-controls';

const Menu: Component = () => {
    const startGame = () => {
        audioManager.playSfx('floomp1');
        audioManager.stopMusic();
        setCurrentRoute(Route.Game);
    };

    onMount(() => {
        audioManager.playMusic('menu');
    })

    return (
        <div class={styles.container}>
            <video
                class={styles.backgroundVideo}
                autoplay
                muted
                loop
                playsinline
                disablepictureinpicture>
                <source src={`${getBasePath()}videos/menu.mp4`} type="video/mp4" />
                <source src={`${getBasePath()}videos/menu.webm`} type="video/webm" />
            </video>
            <div class={styles.overlay}>
                <Typography variant='h1' class={styles.title}>
                    Breakout
                </Typography>
                <Button
                    variant='contained'
                    size='large'
                    class={styles.playButton}
                    onClick={startGame}
                >
                    Play
                </Button>
                <AudioControls />
                <div class={styles.noticeContainer}>
                    <div class={styles.arrowContainer}>
                        <div class={styles.arrow} />
                    </div>
                    <div class={styles.notice}>
                        <Typography variant='body1' class={styles.noticeText}>
                            Click music button to enable audio
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Menu;