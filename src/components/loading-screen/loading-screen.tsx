import { Component, createSignal, onMount, onCleanup } from 'solid-js';
import { CircularProgress, Typography } from '@suid/material';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getBasePath } from '../../state/route-state';
import styles from './loading-screen.module.scss';

const LoadingScreen: Component = () => {
    const [dots, setDots] = createSignal('');
    const destroy$ = new Subject<void>();
    let dotCount = 0;

    const updateDots = () => {
        dotCount++;
        setDots('.'.repeat(dotCount % 5));
    };

    onMount(() => {
        updateDots();
        interval(500)
            .pipe(takeUntil(destroy$))
            .subscribe(updateDots);
    });

    onCleanup(() => {
        destroy$.next();
        destroy$.complete();
    });

    return (
        <div class={styles.container} style={{ 'background-image': `url(${getBasePath()}images/loading_2.png)` }}>
            <div class={styles.content}>
                <CircularProgress class={styles.spinner} color="secondary" />
                <Typography variant="h3" class={styles.text}>
                    LOADING{dots()}
                </Typography>
            </div>
        </div>
    );
}

export default LoadingScreen;