const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WorkingStationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    tel: {
      type: String,
    },
    openTime: {
      type: String,
      required: [true, "Please add open time"],
    },
    closeTime: {
      type: String,
      required: [true, "Please add close time"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Cascade delete reservations when a working space is deleted
WorkingStationSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log(`Reservations being removed from working space ${this._id}`);
    await this.model("Reservation").deleteMany({ workingSpace: this.__id });
    next();
  }
);

// Reverse poppulate with virtuals
WorkingStationSchema.virtual("reservation", {
  ref: "Reservation",
  localField: "_id",
  foreignField: "workingSpace",
  justOne: false,
});

module.exports = mongoose.model("WorkingSpace", WorkingStationSchema);
