'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.redirect('/', '/index.html', 302);

  router.resources('images', '/api/images', controller.rest);
  router.resources('tags', '/api/tags', controller.rest);

  router.post('/api/upload', controller.image.upload);

  router.post('/api/predict', controller.predict.index);

};
