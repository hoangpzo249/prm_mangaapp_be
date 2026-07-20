const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');
const { auth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { createGenreRules, updateGenreRules } = require('../middlewares/validators/genreValidator');

// Public
router.get('/', genreController.getGenres);
router.get('/:id', genreController.getGenreById);

// Admin
router.get('/admin/all', auth, authorize('admin'), genreController.getAllGenres);
router.post('/', auth, authorize('admin'), validate(createGenreRules), genreController.createGenre);
router.put('/:id', auth, authorize('admin'), validate(updateGenreRules), genreController.updateGenre);
router.delete('/:id', auth, authorize('admin'), genreController.deleteGenre);

module.exports = router;
