var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const crypto = require("crypto");

var activitySchema = mongoose.Schema({
  time: { type: String },
  description: { type: String },
  location: { type: String }
});

var itinerarySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    destination: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    shareableId: {
      type: String,
      default: null
    },
    activities: {
      type: [activitySchema],
      default: []
    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }
);

//Indexing for unique Combination of userId, title and Destination
itinerarySchema.index({ userId: 1, title: 1, destination: 1 }, { unique: true });

// MODEL EXPORT
var Itinerary = (module.exports = mongoose.model("itinerary", itinerarySchema));

module.exports.addOne = (data) => {
  var newData = new Itinerary(data);
  return newData.save();
};

module.exports.getAll = (query, skip, limit, sortField) => {
  var sortObj = {};
  sortObj[sortField] = 1;

  return Itinerary.find(query)
    .select("-email -userId -activities._id") //-_id
    .sort(sortObj)
    .skip(skip)
    .limit(limit);
};

module.exports.getCount = (query) => {
  return Itinerary.countDocuments(query);
};

module.exports.findById = (id) => {
  return Itinerary.findOne({ _id: id });
};

module.exports.updateOne = (id, data) => {
  data.updatedAt = new Date();

  return Itinerary.findOneAndUpdate(
    { _id: id },
    { $set: data },
    { new: true, runValidators: true }
  );
};

module.exports.deleteOne = (id) => {
  return Itinerary.findOneAndDelete({ _id: id });
};

module.exports.getBySearch = (searchstring) => {
  return Itinerary.find({
    $or: [
      { title: { $regex: searchstring, $options: "i" } },
      { destination: { $regex: searchstring, $options: "i" } },
    ],
  }).select("-email");
};

// Generate shareable link ID
module.exports.generateShareId = async (id) => {
  const shareId = crypto.randomBytes(16).toString("hex");

  return Itinerary.findOneAndUpdate(
    { _id: id },
    { shareableId: shareId },
    { new: true }
  );
};

// Find by shareable ID
module.exports.findByShareId = (shareableId) => {
  return Itinerary.findOne({ shareableId: shareableId });
};