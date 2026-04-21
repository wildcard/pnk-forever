import { startApp } from 'narrat';
import 'narrat/dist/style.css';
import './game.css';
import scripts from './config/scripts';
import {
  isAiMode,
  mountAiRibbon,
  registerAiNpcPlugin,
} from './plugins/ai-npc-plugin';
import {
  isTesterMode,
  mountTesterRibbon,
  registerTesterPlugin,
} from './plugins/tester-plugin';

// Register plugins BEFORE startApp so their customCommands are in the
// narrat parser's root vocabulary when scripts are parsed.
registerAiNpcPlugin();
registerTesterPlugin();

const aiMode = isAiMode();
const testerMode = isTesterMode();

window.addEventListener('load', () => {
  // Visual tells: AI mode (blue) and tester mode (orange) ribbons.
  mountAiRibbon();
  mountTesterRibbon();
  startApp({
    configPath: 'data/config.yaml',
    // Enable narrat's dev panel when either AI or tester mode is on —
    // useful for jumping directly to a label without playing prologue.
    logging: aiMode || testerMode,
    debug: aiMode || testerMode,
    container: '#app',
    scripts,
  });
});
