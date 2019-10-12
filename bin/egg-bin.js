#!/usr/bin/env node

'use strict';
//注册命令egg-bin，调用index.js的start()方法
const Command = require('..');

new Command().start();
