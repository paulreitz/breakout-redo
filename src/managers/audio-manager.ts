import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface AudioCollections {
    SFX: Record<string, string>;
    Music: Record<string, string>;
    BackgroundMusic: Record<string, string>;
}

type MusicState = 
    | { kind: 'music'; key: string }
    | { kind: 'background' }
    | { kind: 'none' };

export default class AudioManager {
    private destroy$ = new Subject<void>();
    private musicEnded$ = new Subject<void>();
    private backgroundMusic: string[] = [];
    private loadedSfx: Map<string, HTMLAudioElement> = new Map();
    private currentMusic: HTMLAudioElement | null = null;

    private _playMusic = false;
    private _playSfx = false;

    private audioCollections: AudioCollections;

    private _musicState: MusicState = { kind: 'none' };

    constructor(audioCollections: AudioCollections) {
        this.audioCollections = audioCollections;
        this.preloadSfx();
    }

    public setPlayMusic(enabled: boolean): void {
        const wasEnabled = this._playMusic;
        this._playMusic = enabled;

        if (wasEnabled && !enabled && this.currentMusic) {
            this.currentMusic.pause();
            this.cleanupCurrentMusic();
        }
    }

    public setPlaySfx(enabled: boolean): void {
        this._playSfx = enabled;
    }

    private preloadSfx(): void {
        Object.entries(this.audioCollections.SFX).forEach(([key, path]) => {
            const audio = new Audio(path);
            audio.preload = 'auto';
            this.loadedSfx.set(key, audio);
        });
    }

    private initializeBackgroundMusic(): void {
        if (this.backgroundMusic.length === 0) {
            this.backgroundMusic = Object.values(this.audioCollections.BackgroundMusic);
        }
    }

    private getRandomSong(): string {
        this.initializeBackgroundMusic();
        
        const randomIndex = Math.floor(Math.random() * this.backgroundMusic.length);
        const selectedSong = this.backgroundMusic[randomIndex];

        this.backgroundMusic.splice(randomIndex, 1);

        return selectedSong;
    }

    private cleanupCurrentMusic(): void {
        this.musicEnded$.next();
        this.currentMusic = null;
    }

    private startBackgroundMusicInternal(): void {
        if (this.currentMusic) return;
        this._musicState = { kind: 'background' };

        const songPath = this.getRandomSong();
        this.currentMusic = new Audio(songPath);

        fromEvent<Event>(this.currentMusic, 'ended')
            .pipe(takeUntil(this.musicEnded$))
            .subscribe(() => {
                this.cleanupCurrentMusic();
                if (this._playMusic) {
                    this.startBackgroundMusicInternal();
                }
            });

        this.currentMusic.volume = 0.5;
        this.currentMusic.play().catch((error) => {
            console.warn('Failed to play music:', error);
            this.cleanupCurrentMusic();
        });
    }

    public startBackgroundMusic(): void {
        if (!this._playMusic) return;

        this.initializeBackgroundMusic();
        this.startBackgroundMusicInternal();
    }

    public playMusic(key: string): void {
        this._musicState = { kind: 'music', key };
        if (!this._playMusic) return;
        this.cleanupCurrentMusic();

        const songPath = this.audioCollections.Music[key];
        const audio = new Audio(songPath);
        this.currentMusic = audio;

        fromEvent<Event>(audio, 'ended')
            .pipe(takeUntil(this.musicEnded$))
            .subscribe(() => {
                this.cleanupCurrentMusic();
                if (this._playMusic) {
                    this.playMusic(key);
                }
            });
        
        audio.volume = 0.5;
        audio.play().catch((error) => {
            console.warn(`Failed to play music "${key}":`, error);
            this.cleanupCurrentMusic();
        });
    }

    public playLastMusic(): void {
        switch (this._musicState.kind) {
            case 'music':
                this.playMusic(this._musicState.key);
                break;
            case 'background':
                this.startBackgroundMusic();
                break;
        }
    }

    public stopMusic(): void {
        if (this.currentMusic) {
            this._musicState = { kind: 'none' };
            this.currentMusic.pause();
            this.cleanupCurrentMusic();
        }
    }

    public playSfx(key: string): void {
        if (!this._playSfx) return;

        const audio = this.loadedSfx.get(key);
        if (audio) {
            const audioClone = audio.cloneNode() as HTMLAudioElement;
            audioClone.play().catch((error) => {
                console.warn(`Failed to play SFX "${key}":`, error);
            });
        }
    }

    public destroy(): void {
        this.destroy$.next();
        this.destroy$.complete();

        this.musicEnded$.next();
        this.musicEnded$.complete();

        this.loadedSfx.forEach((audio) => {
            audio.src = '';
            audio.load();
        });
        this.loadedSfx.clear();
        this.cleanupCurrentMusic();
        this.backgroundMusic = [];
    }
}