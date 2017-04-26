var imageRouter = require('express').Router();
var multer = require('multer');
var db = require('./database')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/srv/theLinkApi/images')
  },
  filename: function (req, file, cb) {
    var ext = file.originalname.split('.').pop();
    cb(null, db.genUuid() + '.' + ext);
  }
})

var upload = multer({
  storage: storage
})

imageRouter.post('/', upload.single('thumbnail'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  res.send({
    filename: req.file.filename
  });
})

module.exports = imageRouter;