import { Component, Show } from 'solid-js';
import { IconButton } from '@suid/material';
import MusicNote from '@suid/icons-material/MusicNote';
import MusicOff from '@suid/icons-material/MusicOff';
import VolumeUp from '@suid/icons-material/VolumeUp';
import VolumeOff from '@suid/icons-material/VolumeOff';
import styles from './audio-controls.module.scss';
import { playMusic, playSound, togglePlayMusic, togglePlaySound, audioManager } from '../../state/audio-state';

const AudioControls: Component = () => {
    const handlePlaySound = () => {
        togglePlaySound();
        audioManager.playSfx('clop');
    };

    const handlePlayMusic = () => {
        togglePlayMusic();
        audioManager.playSfx('clop');
        audioManager.playLastMusic();
    }

    return (
        <div class={styles.container}>
            <IconButton
                class={styles.button}
                onClick={handlePlaySound}
                sx={{ color: 'white'}}
            >
                <Show when={playSound()}>
                    <VolumeUp />
                </Show>
                <Show when={!playSound()}>
                    <VolumeOff />
                </Show>
            </IconButton>
            <IconButton
                class={styles.button}
                onClick={handlePlayMusic}
                sx={{ color: 'white'}}
            >
                <Show when={playMusic()}>
                    <MusicNote />
                </Show>
                <Show when={!playMusic()}>
                    <MusicOff />
                </Show>
            </IconButton>
        </div>
    );
}

export default AudioControls;
