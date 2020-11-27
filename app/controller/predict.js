'use strict';

const Controller = require('egg').Controller;
const tfnode = require('@tensorflow/tfjs-node');
const jimp = require('jimp');

class PredictController extends Controller {
  async index() {
    const {
      ctx,
    } = this;
    const {
      name,
      version,
    } = ctx.request.query;
    const n = name || 'aitag';
    const v = version ? '/version/' + version : '';
    const url = 'http://192.168.82.205:8001/v1/models/' + n + v + ':predict';
    const tagUrl = 'http://192.168.82.205/file/model/' + n + '/model.labels';
    const data = ctx.request.body;

    if (!data.images || !Array.isArray(data.images)) {
      ctx.status = 401;
      ctx.body = 'lack of images array';
      return;
    }

    try {
      this.app.tags = this.app.tags || {};
      const tags = this.app.tags[n] || await ctx.curl(tagUrl, { dataType: 'json' });
      this.app.tags[n] = tags;
      const out = [];

      const input_data = new Uint8Array(3 * 299 * 299);
      for (const path of data.images) {
        // Convert image to Unit8Array
        const image = await jimp.read(path);
        image.resize(299, 299);
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
          // Extract RGB data from RGBA data
          const i = Math.floor(idx / 4);
          const rgb = { r: 0, g: 1 * 299 * 299, b: 2 * 299 * 299 };
          input_data[i + rgb.r] =
            image.bitmap.data[idx + 0]; // R
          input_data[i + rgb.g] =
            image.bitmap.data[idx + 1]; // G
          input_data[i + rgb.b] =
            image.bitmap.data[idx + 2]; // B
        });
        // Convert Unit8Array to Tensor
        let netInput = tfnode.tensor3d(input_data, [ 3, 299, 299 ], 'float32');
        netInput = netInput.reshape([ -1, 3, 299, 299 ]);

        const inputs = { inputs: { inception_resnet_v2_input: netInput.arraySync() } };
        const ret = await ctx.curl(url, { method: 'POST', data: inputs, dataType: 'json', contentType: 'json' });

        const results = [];
        if (tags.data && ret.data) {
          for (let i = 0; i < tags.data.length; ++i) {
            results.push({ tag: tags.data[i], score: ret.data.outputs[0][i] });
          }
          results.sort((resultA, resultB) => { return resultB.score - resultA.score; });
        }

        out.push({
          image: path,
          outputs: results,
        });
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
}

module.exports = PredictController;