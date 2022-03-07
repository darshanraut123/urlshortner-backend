const mongoose = require('mongoose');

const ShortUrlSchema = new mongoose.Schema({
    url:String,
    shortid:String
});

const ShortUrl = mongoose.model('shortUrl',ShortUrlSchema);
module.exports=ShortUrl;