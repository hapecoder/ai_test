'use strict';

const fs = require('fs');
const path = require('path');
const pump = require('pump');
const Controller = require('egg').Controller;

class ImageController extends Controller {
  async upload() {
    const { ctx } = this;
    const file = ctx.request.files[0];
    if (!file) return ctx.throw(404);

    const filename = file.filename.toLowerCase();
    const dirname = 'app/public';
    const targetPath = path.join(this.config.baseDir, dirname, filename);
    const source = fs.createReadStream(file.filepath);
    const target = fs.createWriteStream(targetPath);


    try {
      await pump(source, target);
      ctx.logger.info('save %s to %s', file.filepath, targetPath);
    } finally {
      // delete those request tmp files
      await ctx.cleanupRequestFiles();
    }
    ctx.status = 200;
    ctx.body = Buffer.from(path.join(dirname, filename)).toString("base64");
  }
}

module.exports = ImageController;
