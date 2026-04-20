import { startApp } from 'narrat';
import 'narrat/dist/style.css';
import './game.css';
import scripts from './config/scripts';
import {
  isAiMode,
  mountAiRibbon,
  registerAiNpcPlugin,
} from './plugins/ai-npc-plugin';

// Register plugins BEFORE startApp so their customCommands are in the
// narrat parser's root vocabulary when scripts are parsed.
registerAiNpcPlugin();

const aiMode = isAiMode();

window.addEventListener('load', () => {
  // Visual tell that AI mode is on (otherwise the feature is invisible).
  mountAiRibbon();
  startApp({
    configPath: 'data/config.yaml',
    // Enable narrat's dev panel when AI mode is on — useful for jumping
    // directly to an ai_demo label without playing through the prologue.
    logging: aiMode,
    debug: aiMode,
    container: '#app',
    scripts,
  });
});
