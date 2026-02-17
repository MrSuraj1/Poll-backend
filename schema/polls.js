const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  question: String,
  options: [
    {
      text: String,
      votes: {
        type: Number,
        default: 0
      }
    }
  ],
  voters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  ipAddresses: [
  {
    type: String
  }
]

});

module.exports = mongoose.model("Poll", pollSchema);
