const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { createNote, getNotes, deleteNote } = require('../controllers/notes');

// Apply auth middleware to all note routes
router.use(auth);

// POST /api/notes (Create a note)
router.post('/', createNote);

// GET /api/notes (Get all notes)
router.get('/', getNotes);

// DELETE /api/notes/:id (Delete a note)
router.delete('/:id', deleteNote);

module.exports = router;