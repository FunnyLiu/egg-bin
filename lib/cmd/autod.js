'use strict';

const Command = require('../command');
// 继承自command.js
class AutodCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin autod';
    this.options = {
      check: {
        description: 'dependencies checker',
      },
    };
  }

  get description() {
    return 'Generate pkg.dependencies and pkg.devDependencies automatically';
  }
  // 提供run函数
  * run({ cwd, argv }) {
    const args = [];
    // 解析参数加参数
    if (argv.check) args.push('--check');
    // 查找对应文件
    const autodBin = require.resolve('autod/bin/autod.js');
    // forkNode开启子进程做autodBin任务
    yield this.helper.forkNode(autodBin, args, { cwd });
  }
}

module.exports = AutodCommand;
