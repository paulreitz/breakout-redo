import { createSignal } from 'solid-js';
import AudioManager, { AudioCollections } from '../managers/audio-manager';

const [playSound, setPlaySound] = createSignal<boolean>(true);
const [playMusic, setPlayMusic] = createSignal<boolean>(false);

const audioCollections: AudioCollections = {
    SFX: {
        clop: '/assets/sounds/eleven/clop.mp3',
        floomp1: '/assets/sounds/eleven/floomp01.mp3',
        thwup: '/assets/sounds/eleven/thwup.mp3',
        swoop: '/assets/sounds/eleven/swoopin.mp3',
        plomp: '/assets/sounds/eleven/plomp.mp3',
        thwong: '/assets/sounds/eleven/thwong.mp3',
        klup: '/assets/sounds/eleven/klup.mp3',
        ploomp: '/assets/sounds/eleven/ploomp.mp3',
        bunzz: '/assets/sounds/eleven/bunzz.mp3',
    },
    Music: {
        menu: '/assets/sounds/music/Ethereal_Journey.mp3',
        endscreen: '/assets/sounds/music/After_the_Glow.mp3',
    },
    BackgroundMusic: {
        chaising: '/assets/sounds/background/Chasing_Horizons.mp3',
        whispering: '/assets/sounds/background/Whispered_Horizon.mp3',
        gold: '/assets/sounds/background/Waves_of_Gold.mp3',
        horizon: '/assets/sounds/background/Whispers_of_the_Horizon.mp3',
        neon: '/assets/sounds/background/Neon_Moon.mp3',
        dreams: '/assets/sounds/background/Neon_Dreams.mp3',
        whisper: '/assets/sounds/background/Whispers_in_Neon.mp3',
    }
};
const audioManager = new AudioManager(audioCollections);
audioManager.setPlayMusic(playMusic());
audioManager.setPlaySfx(playSound());

export const togglePlaySound = () => {
    setPlaySound(!playSound());
    audioManager.setPlaySfx(playSound());
}
export const togglePlayMusic = () => {
    setPlayMusic(!playMusic());
    audioManager.setPlayMusic(playMusic());
};

export {
    playSound,
    playMusic,
    audioManager
};

