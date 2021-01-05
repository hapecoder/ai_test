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

  config.mongoose = {
    client: {
      url: 'mongodb://test:test@192.168.82.204/admin',
      options: {
        autoIndex: false, useUnifiedTopology: true,

      },
    // mongoose global plugins, expected a function or an array of function and options
    // plugins: [createdPlugin, [updatedPlugin, pluginOptions]],
    },
  };

  config.modelServer = 'http://192.168.82.205:8001';
  config.tagServer = 'http://192.168.82.205/file/model/';

  return {
    ...config,
  };

};
