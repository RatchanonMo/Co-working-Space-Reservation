const Reservation = require("../models/Reservation");
const WorkingSpace = require("../models/WorkingSpace");

exports.getAllReservation = async (req, res, next) => {
  let query;

  // General users can see only their reservation
  if (req.user.role !== "admin") {
    query = Reservation.find({ user: req.user.id }).populate({
      path: "workingSpace",
      select: "name address tel",
    });
  } else {
    // if you are an admin, u can see it all
    if (req.params.workingSpaceId) {
      console.log(req.params.workingSpaceId);

      query = Reservation.find({ workingSpace: req.params.workingSpaceId }).populate({
        path: "workingSpace",
        select: "name address tel",
      });
    } else {
      query = Reservation.find().populate({
        path: "workingSpace",
        select: "name address tel",
      });
    }
  }

  try {
    const reservation = await query;

    res.status(200).json({
      success: true,
      count: reservation.length,
      data: reservation,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Appointment" });
  }
};

exports.getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate({
      path: "workingSpace",
      select: "name description tel",
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `No reservation with the id of ${req.params.id}1`,
      });
    }
    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find reservation" });
  }
};

exports.addReservation = async (req, res, next) => {
  try {
    req.body.workingSpace = req.params.workingSpaceId;
    

    const workingspace = await WorkingSpace.findById(req.params.workingSpaceId);
    if (!workingspace) {
      return res.status(404).json({
        success: false,
        message: `No working space with the id of ${req.params.workingSpaceId}`,
      });
    }

    // add user Id to req.body
    req.body.user = req.user.id;
    // Check for existed reservation
    const existedReservation = await Reservation.find({ user: req.user.id });
    //If the user is not an admin, they can only create 3 reservation.
    if (existedReservation.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made 3 reservations`,
      });
    }
    const reservation = await Reservation.create(req.body);
    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create Reservation" });
  }
};

exports.updateReservation = async (req, res, next) => {
  try {
    let reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `No reservation with the id of ${req.params.id}`,
      });
    }

    //Make sure user is the reservation owner
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this reservation`,
      });
    }

    reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Reservation" });
  }
};

exports.deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `No reservation with the id of ${req.params.id}`,
      });
    }

    //Make sure user is the reservation owner
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(401)
        .json({
          success: false,
          message: `User ${req.user.id} is not authorized to delete this reservation`,
        });
    }
    await reservation.deleteOne();
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete Reservation" });
  }
};
