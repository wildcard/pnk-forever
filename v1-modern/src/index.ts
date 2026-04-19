import { startApp } from 'narrat';
import 'narrat/dist/style.css';
import './game.css';
import scripts from './config/scripts';

window.addEventListener('load', () => {
  startApp({
    configPath: 'data/config.yaml',
    logging: false,
    debug: false,
    container: '#app',
    scripts,
  });
});
