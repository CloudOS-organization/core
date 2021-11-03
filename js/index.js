import {use, global} from './deps.js';
import Main from './main.js';

use(Main);

global.main = Main.create();
document.body.appendChild(global.main);
