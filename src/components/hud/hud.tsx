import { Component, JSX } from 'solid-js';
import { score, lives, maxLives } from '../../state/game-states'
import Favorite from '@suid/icons-material/Favorite';
import  HeartBroken  from '@suid/icons-material/HeartBroken';
import styles from './hud.module.scss';

import AudioControls from '../audio-controls/audio-controls';

const Hud: Component = () => {
    const renderLives = () => {
        const hearts: JSX.Element = [];
        const livesCount = Math.max(lives() - 1, 0);
        const maxLivesCount = maxLives() - 1;

        for (let i = 0; i < livesCount; i++) {
            hearts.push(<Favorite class={styles.heart} color='inherit' />);
        }
        for (let i = livesCount; i < maxLivesCount; i++) {
            hearts.push(<HeartBroken class={styles.heart} color='warning' />);
        }

        return hearts;
    }
    return (
        <div class={styles.container}>
            <div class={styles.hudContainer}>
                <AudioControls />
                <div class={styles.block}>
                    <span class={styles.lives}>{renderLives()}</span>
                </div>
                <div class={styles.block}>
                    <span class={styles.label}>Score:</span>
                    <span class={styles.value}>{score()}</span>
                </div>
            </div>
        </div>
    );
}

export default Hud;