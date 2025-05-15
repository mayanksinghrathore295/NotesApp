import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Notes({ setIsAuthenticated }) {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await axios.get('http://localhost:5000/api/notes', {
          headers: { 'x-auth-token': token },
        });
        setNotes(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          navigate('/login');
        } else {
          setError('Failed to fetch notes');
        }
      }
    };

    fetchNotes();
  }, [setIsAuthenticated, navigate]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUploadNotes = async () => {
    if (!file || !title || !content) {
      setError('Please fill in title, content, and choose a file');
      return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('content', content);

    try {
      const response = await axios.post('http://localhost:5000/api/notes', formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
      });
      setNotes((prev) => [...prev, response.data]);
      setTitle('');
      setContent('');
      setFile(null);
      setError('');
    } catch (err) {
      setError('Failed to upload file');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div style={{
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif', 
      padding: '20px',
      textAlign: 'center',
    }}>
      <h2 style={{ marginBottom: '20px' }}>Notes</h2>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {localStorage.getItem('token') && (
        <div style={{
          border: '1px solid #ccc',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          marginBottom: '30px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'left',  // Align the form inputs left
        }}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '15px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxSizing: 'border-box',
            }}
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '15px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxSizing: 'border-box',
            }}
          />
          <input
            type="file"
            onChange={handleFileChange}
            style={{
              width: '100%',
              marginBottom: '15px',
            }}
          />
          <br />
          <button
            onClick={handleUploadNotes}
            style={{
              padding: '12px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Upload Note
          </button>
        </div>
      )}

      <ul style={{
        listStyle: 'none',
        padding: 0,
        marginTop: '20px',
        textAlign: 'left',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        {notes.map((note) => (
          <li key={note._id} style={{
            borderBottom: '1px solid #ddd',
            paddingBottom: '20px',
            marginBottom: '20px',
            paddingLeft: '15px',
            paddingRight: '15px',
          }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.25em' }}>{note.title}</h3>
            <p style={{ marginBottom: '10px' }}>{note.content}</p>
            {note.file && (
              <a
                href={`http://localhost:5000/uploads/${note.file}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#007BFF', textDecoration: 'none' }}
              >
                View File
              </a>
            )}
          </li>
        ))}
      </ul>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={handleLogout}
          style={{
            padding: '12px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
            maxWidth: '200px', // Center and limit the width of the logout button
            marginTop: '20px',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Notes;
