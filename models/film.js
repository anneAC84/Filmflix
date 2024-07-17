const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  content: {
    type:String, 
    required: true 
  },
  rating: { 
  type: Number, min: 1, max: 5, default: 5},
})

const filmSchema = new mongoose.Schema({
    title: {
        type:String,
        required: true,
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
    required: true,
   
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

  reviews: [reviewSchema],
 
 

})

const Film = mongoose.model('Film', filmSchema);

module.exports = Film;