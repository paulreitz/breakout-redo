import { createSignal } from 'solid-js';
import AudioManager, { AudioCollections } from '../managers/audio-manager';
import { getBasePath } from './route-state';

const [playSound, setPlaySound] = createSignal<boolean>(true);
const [playMusic, setPlayMusic] = createSignal<boolean>(false);

const audioCollections: AudioCollections = {
   SFX: {
       clop: `${getBasePath()}assets/sounds/eleven/clop.mp3`,
       floomp1: `${getBasePath()}assets/sounds/eleven/floomp01.mp3`,
       thwup: `${getBasePath()}assets/sounds/eleven/thwup.mp3`,
       swoop: `${getBasePath()}assets/sounds/eleven/swoopin.mp3`,
       plomp: `${getBasePath()}assets/sounds/eleven/plomp.mp3`,
       thwong: `${getBasePath()}assets/sounds/eleven/thwong.mp3`,
       klup: `${getBasePath()}assets/sounds/eleven/klup.mp3`,
       ploomp: `${getBasePath()}assets/sounds/eleven/ploomp.mp3`,
       bunzz: `${getBasePath()}assets/sounds/eleven/bunzz.mp3`,
   },
   Music: {
       menu: `${getBasePath()}assets/sounds/music/Ethereal_Journey.mp3`,
       endscreen: `${getBasePath()}assets/sounds/music/After_the_Glow.mp3`,
   },
   BackgroundMusic: {
       chaising: `${getBasePath()}assets/sounds/background/Chasing_Horizons.mp3`,
       whispering: `${getBasePath()}assets/sounds/background/Whispered_Horizon.mp3`,
       gold: `${getBasePath()}assets/sounds/background/Waves_of_Gold.mp3`,
       horizon: `${getBasePath()}assets/sounds/background/Whispers_of_the_Horizon.mp3`,
       neon: `${getBasePath()}assets/sounds/background/Neon_Moon.mp3`,
       dreams: `${getBasePath()}assets/sounds/background/Neon_Dreams.mp3`,
       whisper: `${getBasePath()}assets/sounds/background/Whispers_in_Neon.mp3`,
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

