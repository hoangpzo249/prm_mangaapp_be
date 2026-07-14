const genreService = require('../services/genreService');

// ============================================================
// Genre Controller — API thể loại
// ============================================================

exports.getGenres = async (req, res, next) => {
    try {
        const genres = await genreService.getActiveGenres();
        res.json(genres);
    } catch (error) {
        next(error);
    }
};

exports.getAllGenres = async (req, res, next) => {
    try {
        const genres = await genreService.getAllGenres();
        res.json(genres);
    } catch (error) {
        next(error);
    }
};

exports.getGenreById = async (req, res, next) => {
    try {
        const genre = await genreService.getGenreById(req.params.id);
        res.json(genre);
    } catch (error) {
        next(error);
    }
};

exports.createGenre = async (req, res, next) => {
    try {
        const genre = await genreService.createGenre(req.body);
        res.status(201).json(genre);
    } catch (error) {
        next(error);
    }
};

exports.updateGenre = async (req, res, next) => {
    try {
        const genre = await genreService.updateGenre(req.params.id, req.body);
        res.json(genre);
    } catch (error) {
        next(error);
    }
};

exports.deleteGenre = async (req, res, next) => {
    try {
        const result = await genreService.deleteGenre(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
