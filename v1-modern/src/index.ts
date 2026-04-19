import { startApp } from 'narrat';
import scripts from './config/scripts';

window.addEventListener('load', () => {
  startApp({
    configPath: 'data/config.yaml',
    logging: false,
    debug: true,
    scripts,
  });
});
