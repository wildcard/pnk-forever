import { startApp, registerPlugin } from 'narrat';
import config from './config/config';
import scripts from './config/scripts';

window.addEventListener('load', () => {
  startApp({
    configPath: 'data/config.yaml',
    logging: false,
    debug: true,
    scripts,
  }, config);
});
