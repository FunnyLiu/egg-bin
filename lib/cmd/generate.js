'use strict';

const debug = require('debug')('egg-bin');
const Command = require('../command');
const path = require('path');
const utils = require('egg-utils');

class GenerateCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin generate [options]';

    this.options = {
      type: {
        description: 'choose which generators to exec',
        type: 'string',
      },
      env: {
        description: 'server env',
        type: 'string',
        default: 'prod',
      },
      baseDir: {
        description: 'directory of application, default to `process.cwd()`',
        type: 'string',
      },
      framework: {
        description: 'specify framework that can be absolute path or npm package',
        type: 'string',
      },
    };
  }

  get description() {
    return 'Run generators';
  }

  * run(context) {
    const { cwd, argv } = context;

    /* istanbul ignore next */
    let baseDir = argv._[0] || argv.baseDir || cwd;
    /* istanbul ignore next */
    if (!path.isAbsolute(baseDir)) baseDir = path.join(cwd, baseDir);

    const framework = utils.getFrameworkPath({
      framework: argv.framework,
      baseDir,
    });

    const options = {
      baseDir,
      framework,
      env: argv.env,
      argv,
    };

    // [ { path, type }]
    options.loadUnit = utils.getLoadUnits(options);
    options.config = utils.getConfig(options);
    options.plugins = utils.getPlugins(options);

    const typeList = argv.type && argv.type.split(',');

    // exec generators
    for (const item of options.loadUnit) {
      // if provide `--type=hsf,grpc` then only exec these generators
      if (typeList && !typeList.includes(item.name)) continue;

      // find generator
      const bin = resolveModule(path.join(item.path, 'generator'));
      if (!bin) continue;

      debug('exec generator: %s(%s)', item.name, bin);
      try {
        const Generator = require(bin);
        const instance = new Generator(options);
        yield instance.generate();
      } catch (err) {
        console.warn('exec %s fail', item.name, err);
      }
    }
  }
}

function resolveModule(filepath) {
  try {
    return require.resolve(filepath);
  } catch (e) {
    return undefined;
  }
}

module.exports = GenerateCommand;