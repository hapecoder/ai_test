/* eslint valid-jsdoc: "off" */

'use strict';

const path = require('path');
const os = require('os');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  config.static = {
    prefix: '/',
    dir: [ path.join(appInfo.baseDir, 'web/dist/spa'), { prefix: '/example', dir: path.join(appInfo.baseDir, 'example') }],
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

  config.mongoose = {
    client: {
      url: 'mongodb://aitest:tagger@mongo-aitest/admin',
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
    modelServer: 'http://openvino_model_server:8001',
    tagServer: 'labels',
    imgdir: path.join(os.tmpdir(), appInfo.name, 'images'),
  };

  return {
    ...config,
    ...userConfig,
  };
};
