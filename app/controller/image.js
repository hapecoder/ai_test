'use strict';

const fs = require('fs');
const path = require('path');
const pump = require('pump');
// const jimp = require('jimp');
const Controller = require('egg').Controller;

class ImageController extends Controller {
  async upload() {
    const { ctx } = this;
    const { imgdir } = this.config;
    const file = ctx.request.files[0];
    const date = new Date();
    if (!file) return ctx.throw(404);

    let filename = file.filename.toLowerCase();
    const todaydir = path.join(
      date.getFullYear().toString(),
      (date.getMonth() + 1).toString(),
      date.getDate().toString());
    const dirname = path.join(
      imgdir,
      todaydir
    );

    fs.existsSync(dirname) ? '' : fs.mkdirSync(dirname, { recursive: true });
    let targetPath = path.join(dirname, filename);
    if (fs.existsSync(targetPath)) {
      ctx.logger.info('file exist: ' + targetPath);
      const stat = fs.statSync(targetPath);
      const stat1 = fs.statSync(file.filepath);
      if (!(stat && stat1 && stat.size === stat1.size)) {
        filename = path.basename(file.filepath);
      }
      targetPath = path.join(dirname, filename);
    }
    const source = fs.createReadStream(file.filepath);
    const target = fs.createWriteStream(targetPath);
    try {
      await pump(source, target);
    } catch (e) {
      ctx.logger.error('copy file failed: ' + e);
    } finally {
      // delete those request tmp files
      await ctx.cleanupRequestFiles();
    }
    ctx.status = 200;
    ctx.body = Buffer.from(targetPath).toString('base64');
    ctx.logger.info('uploaded file: ' + targetPath);
  }
}

module.exports = ImageController;
