const mongoose = require("mongoose");

module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      userName: String,
      acountNumber: String,
      emailAddress: String,
      identityNumber: String
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const User = mongoose.model("users", schema);
  return User;
};