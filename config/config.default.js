/* eslint valid-jsdoc: "off" */

'use strict';

const path = require('path');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  config.cluster = {
    listen: {
      port: 10050,
      hostname: '127.0.0.1',
    },
  };

  config.static = {
    prefix: '/',
    dir: path.join(appInfo.baseDir, 'web/dist/spa'),
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1604555813845_4226';

  // add your middleware config here
  config.middleware = [];

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  config.logger = { level: process.env.LOG_LEVEL || 'INFO' };

  config.proxy = true;

  config.ipHeaders = 'X-Real-IP, X-Forwarded-For, REMOTE_ADDR';
  config.maxIpsCount = 1;

  config.multipart = {
    mode: 'file',
    fileSize: '100mb',
    whitelist: [
      '.jpg', '.jpeg', '.png', '.bmp',
    ],
    // whitelist: () => { return true; },
    // tmpdir: path.join(os.tmpdir(), 'egg-multipart-tmp', appInfo.name),
    // cleanSchedule: {
    //   // run tmpdir clean job on every day 04:30 am
    //   // cron style see https://github.com/eggjs/egg-schedule#cron-style-scheduling
    //   cron: '0 30 10 * * *',
    // },
  };

  exports.mongoose = {
    client: {
      url: 'mongodb://test:test@192.168.82.204/admin',
      options: {
        autoIndex: false, useUnifiedTopology: true,
      },
    // mongoose global plugins, expected a function or an array of function and options
    // plugins: [createdPlugin, [updatedPlugin, pluginOptions]],
    },
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
