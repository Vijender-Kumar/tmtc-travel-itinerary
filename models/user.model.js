var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var bcrypt = require("bcryptjs");

var userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    userpass: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Model
var Users = (module.exports = mongoose.model("user", userSchema));

// Add user with password hashing
module.exports.addOne = async (user) => {
  try {
    const new_user = new Users(user);
    const saltRounds = 10;
    new_user.userpass = await bcrypt.hash(user.userpass, saltRounds);
    return new_user.save();
  } catch (error) {
    return error;
  }
};

module.exports.findByEmail = (email) => {
  return Users.findOne({ email: email });
};