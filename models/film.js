const mongoose = require('mongoose')

const filmSchema = new mongoose.Schema({
    title: {
        type:String,
        required: [true, 'Name is required'],
        unique: true
    },
  yearReleased: {
    type: Number,
    required: true,
  },
 mainActors: {
    type: [String],
    required: true,
 },
  description: {
    type: String,
    required: true
 },

 imageURL: {
    
  type: String,
    required: [true,'URL is required']
   
 }, 


  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true

  },

  favoritedByUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  
})

const Film = mongoose.model('Film', filmSchema);

module.exports = Film;