import { startApp } from 'narrat';
import 'narrat/dist/style.css';
import './game.css';
import scripts from './config/scripts';
import {
  isTesterMode,
  mountTesterRibbon,
  registerTesterPlugin,
} from './plugins/tester-plugin';

// Register plugins BEFORE startApp so their customCommands are available when
// the VM parses scripts (the narrat parser rejects unknown keywords).
registerTesterPlugin();

const testerMode = isTesterMode();

window.addEventListener('load', () => {
  mountTesterRibbon();
  startApp({
    configPath: 'data/config.yaml',
    logging: testerMode,
    debug: testerMode,
    container: '#app',
    scripts,
  });
});
