const mongoose = require('mongoose')

const filmsSchema = new mongoose.Schema({
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

 thumbnail: {
    type: String,
    required: true,
 }, 


  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
 
 
})

const Films = mongoose.model("Films", filmsSchema);

module.exports = Films;