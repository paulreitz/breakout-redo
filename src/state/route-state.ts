import { createSignal } from 'solid-js';
import { Route } from '../types/routes';

export const [currentRoute, setCurrentRoute] = createSignal<Route>(Route.Menu);