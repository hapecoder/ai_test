'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ImageSchema = new Schema({
    info: {
      type: Object,
    },
  });

  return mongoose.model('images', ImageSchema);
};