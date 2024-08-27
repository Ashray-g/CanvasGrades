const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

const BASE_URL = 'https://{subdomain}.instructure.com/api/v1';

app.use(cors());
app.use(express.json());

const getCanvasApiUrl = (subdomain) => {
  return BASE_URL.replace('{subdomain}', subdomain);
};

app.get('/api/courses', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const subdomain = req.headers['canvas-subdomain'];
    if (!token || !subdomain) {
      return res.status(401).json({ error: 'No token or subdomain provided' });
    }
    const canvasApiUrl = getCanvasApiUrl(subdomain);
    console.log('Requesting courses from:', canvasApiUrl); // Add this line
    const coursesResponse = await axios.get(`${canvasApiUrl}/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(coursesResponse.data);
  } catch (error) {
    console.error('Error fetching courses:', error.response?.status, error.response?.data); // Modify this line
    if (error.response) {
      res.status(error.response.status).json({ 
        error: 'Error fetching courses', 
        details: error.response.data 
      });
    } else {
      res.status(500).json({ 
        error: 'Error fetching courses', 
        message: error.message 
      });
    }
  }
});

app.get('/api/grades', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const subdomain = req.headers['canvas-subdomain'];
    if (!token || !subdomain) {
      return res.status(401).json({ error: 'No token or subdomain provided' });
    }
    const canvasApiUrl = getCanvasApiUrl(subdomain);
    const coursesResponse = await axios.get(`${canvasApiUrl}/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const gradesPromises = coursesResponse.data.map(course =>
      axios.get(`${canvasApiUrl}/courses/${course.id}/enrollments?user_id=self`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    );
    const gradesResponses = await Promise.all(gradesPromises);

    const gradesData = {};
    gradesResponses.forEach((response, index) => {
      const courseId = coursesResponse.data[index].id;
      gradesData[courseId] = response.data[0]?.grades?.current_score || 'N/A';
    });

    res.json(gradesData);
  } catch (error) {
    console.error('Error fetching grades:', error);
    if (error.response) {
      res.status(error.response.status).json({ 
        error: 'Error fetching grades', 
        details: error.response.data 
      });
    } else {
      res.status(500).json({ 
        error: 'Error fetching grades', 
        message: error.message 
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});