const Note = require('../models/Note');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // Create uploads directory if not exists
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage }).single('file');

// Create a new note with optional file
exports.createNote = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: `File upload failed: ${err.message}` });
    }

    try {
      const { title = '', content = '' } = req.body;
      const file = req.file ? req.file.filename : null;

      // Ensure req.user is available (set by auth middleware)
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: no user data found' });
      }

      const note = new Note({
        title,
        content,
        file,
        user: req.user, // user ID from auth middleware
      });

      await note.save();
      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ error: `Failed to save note: ${error.message}` });
    }
  });
};

// Get all notes for the authenticated user
exports.getNotes = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    const notes = await Note.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch notes: ${error.message}` });
  }
};

// Delete a note by ID
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.user.toString() !== req.user) {
      return res.status(403).json({ error: 'Forbidden: cannot delete others\' notes' });
    }

    // Delete attached file if exists
    if (note.file) {
      const filePath = path.join(__dirname, '../uploads', note.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await note.deleteOne();
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: `Failed to delete note: ${error.message}` });
  }
};
