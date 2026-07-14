const Genre = require('../models/Genre');

// ============================================================
// Genre Repository — Data access layer cho Genre
// ============================================================

exports.findAll = () => {
    return Genre.find().sort({ name: 1 }).lean();
};

exports.findActive = () => {
    return Genre.find({ isActive: true }).sort({ name: 1 }).lean();
};

exports.findById = (id) => {
    return Genre.findById(id);
};

exports.findBySlug = (slug) => {
    return Genre.findOne({ slug });
};

exports.findByIds = (ids) => {
    return Genre.find({ _id: { $in: ids } }).lean();
};

exports.create = (data) => {
    const genre = new Genre(data);
    return genre.save();
};

exports.update = (id, data) => {
    return Genre.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.delete = (id) => {
    return Genre.findByIdAndDelete(id);
};
