import { createSignal } from 'solid-js';
import { Route } from '../types/routes';

export const [currentRoute, setCurrentRoute] = createSignal<Route>(Route.Menu);

const isGithubPages = () => {
    const { hostname, pathname } = window.location;
    return hostname.endsWith('github.io') && pathname !== '/';
}

export const getBasePath = () => {
    if (isGithubPages()) {
        return `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'breakout-redo'}/`;
    }
    return '/';
};