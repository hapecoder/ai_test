'use strict';

const Controller = require('egg').Controller;
const tfnode = require('@tensorflow/tfjs-node');
const fs = require('fs');
const Path = require('path');
const jimp = require('jimp');

class PredictController extends Controller {
  async index() {
    const {
      ctx, app,
    } = this;
    const {
      name,
      version,
    } = ctx.request.query;
    const {
      modelServer,
      tagServer,
    } = this.config;
    const n = name || 'aitag_hier';
    const v = version ? '/versions/' + version : '';
    const url = modelServer + '/v1/models/' + n + v + ':predict';
    const tagUrl = tagServer.startsWith('http') ? tagServer + n + '/model.labels' : Path.join(app.baseDir, tagServer, n, 'model.labels');
    const modelParam = { width: 224, height: 224, channel: 3, dtype: 'float32' };
    const data = ctx.request.body;

    if (!data.images || !Array.isArray(data.images)) {
      ctx.status = 401;
      ctx.body = 'lack of images array';
      return;
    }

    try {
      this.app.categories = this.app.categories || {};
      const categories = this.app.categories[n] || (tagServer.startsWith('http') ? (await ctx.curl(tagUrl, { dataType: 'json' })).data : JSON.parse(fs.readFileSync(tagUrl, 'utf-8')));
      this.app.categories[n] = categories;
      const out = [];
      for (const path of data.images) {
        const filePath = path.startsWith('http') ? path : (path.startsWith('/') || path.charAt(1) === ':' ? path : Path.join(app.baseDir, path));
        const netInput = await this.image2Tensor(filePath, modelParam);
        const inputs = { inputs: { input_1: netInput.arraySync() } };
        const ret = await ctx.curl(url, { method: 'POST', data: inputs, dataType: 'json', contentType: 'json' });
        const results = [];
        const keys = [];
        ctx.logger.info(inputs)
        for (const key in ret.data.outputs) {
          keys.push(key);
        }
        // Change Lexicographic order to Integer order
        keys.sort((keyA, keyB) => {
          const numA = keyA.replace(/[^0-9]/ig, '');
          const numB = keyB.replace(/[^0-9]/ig, '');
          return numA - numB;
        });

        if (categories && ret.data) {
          let noChild = 0;
          categories[0].map((e, index1) => {
            const children = [];
            if (e !== 'night' && e !== 'snow') {
              categories[index1 + 1 - noChild].map((v, index2) => {
                children.push({
                  tag: v,
                  score: ret.data.outputs[keys[index1 + 1 - noChild]][0][index2],
                });
              });
            // if ((i > 1 && categories[0][i + noChild - 1] == 'night' || categories[0][i + noChild - 1] == 'snow')) noChild += 1;
            }
            else noChild+=1
            results.push({
              tag: e,
              score: ret.data.outputs[keys[0]][0][index1],
              children,

            });

          });
          // results.sort((resultA, resultB) => { return resultB.score - resultA.score; });
        } else {
          ctx.logger.warn(url, tagUrl, categories, ret);
        }
        out.push({ image: path, outputs: results });
      }
      ctx.body = out;
    } catch (err) {
      ctx.logger.error(err);
      ctx.status = 500;
      ctx.body = err;
      return;
    }
    ctx.status = 200;
  }

  /**
   * Conver an image to a tensor
   *
   * @param {String} path: Path of an image. This can be an uri or a file system path.
   * @param {Object} opt: Options for returned tensor, must contain 'width', 'height', 'channel' and 'dtype' attribute.
   */

  async image2Tensor(path, opt) {
    const input_data = new Uint8Array(opt.channel * opt.width * opt.height);
    const image = await jimp.read(path);
    image.resize(opt.width, opt.height);
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      // Extract RGB data from RGBA data
      const i = Math.floor(idx / 4);
      const rgb = { r: 0, g: 1 * opt.width * opt.height, b: 2 * opt.width * opt.height };
      input_data[i + rgb.r] =
        image.bitmap.data[idx + 0]; // R
      input_data[i + rgb.g] =
        image.bitmap.data[idx + 1]; // G
      input_data[i + rgb.b] =
        image.bitmap.data[idx + 2]; // B
    });
    // Convert Unit8Array to Tensor
    let out = tfnode.tensor3d(input_data, [ opt.channel, opt.width, opt.height ], opt.dtype);
    out = out.reshape([ -1, opt.channel, opt.width, opt.height ]);
    return out;
  }
}

module.exports = PredictController;
