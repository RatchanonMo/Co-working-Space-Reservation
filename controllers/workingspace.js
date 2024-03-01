const WorkingSpace = require("../models/WorkingSpace");

exports.getAllWorkingSpace = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeField = ["select", "sort", "page", "limit"];

    // Loop over remove fields and delete them from reqQuery
    removeField.forEach((param) => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    console.log(queryStr);
    // Create operators ($gt, $gte, etc.)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // finding resource
    query = WorkingSpace.find(JSON.parse(queryStr)).populate("reservation");

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("name");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await WorkingSpace.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const workingspace = await query;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }
    res.status(200).json({
      success: true,
      count: workingspace.length,
      pagination,
      data: workingspace,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

exports.getWorkingSpace = async (req, res, next) => {
  try {
    const workingspace = await WorkingSpace.findById(req.params.id);

    if (!workingspace) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: workingspace });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

exports.createWorkingSpace = async (req, res, next) => {
  console.log(req.body);
  const workingspace = await WorkingSpace.create(req.body);

  res.status(201).json({ success: true, data: workingspace });
};

exports.updateWorkingSpace = async (req, res, next) => {
  try {
    const workingspace = await WorkingSpace.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!workingspace) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: workingspace });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};

exports.deleteWorkingSpace = async (req, res, next) => {
  try {
    const workingspace = await WorkingSpace.findById(req.params.id);

    if (!workingspace) {
      return res.status(400).json({ success: false });
    }

    await workingspace.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};

