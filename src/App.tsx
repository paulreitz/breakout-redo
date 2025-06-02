import type { Component } from 'solid-js';
import { Switch, Match } from 'solid-js';
import { currentRoute } from './state/route-state';
import { Route } from './types/routes';

import styles from './App.module.scss';

import Menu from './pages/menu/menu';
import Game from './pages/game/game';
import EndScreen from './pages/end-screen/end-screen';

const App: Component = () => {
    return (
        <div class={styles.App}>
            <Switch>
                <Match when={currentRoute() === Route.Menu}>
                    <Menu />
                </Match>
                <Match when={currentRoute() === Route.Game}>
                    <Game />
                </Match>
                <Match when={currentRoute() === Route.EndScreen}>
                    <EndScreen />
                </Match>
            </Switch>
        </div>
    );
};

export default App;
