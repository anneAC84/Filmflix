const mongoose = require("mongoose");



const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {  // Add isAdmin field to the schema
    type: Boolean,
    default: false,  // Default to false, unless manually set
  }


});

const User = mongoose.model("User", userSchema);

module.exports = User;
