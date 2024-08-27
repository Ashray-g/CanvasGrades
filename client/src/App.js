import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, X, Plus, Trash2, Edit2, Check, LogIn, LogOut } from 'lucide-react';
import Cookies from 'js-cookie';
import './App.css';
import './LoginScreen.css';

// Constants for grade thresholds
const GRADE_THRESHOLDS = {
  GREEN: 100,
  YELLOW: 97,
  ORANGE: 95,
  RED: 93  // Anything below this is red
};

function App() {
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [visibleCourses, setVisibleCourses] = useState({});
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [courseNames, setCourseNames] = useState({});
  const [editingCourse, setEditingCourse] = useState(null);
  const [editedCourseName, setEditedCourseName] = useState('');
  const [token, setToken] = useState(Cookies.get('token') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [error, setError] = useState('');
  const [canvasSubdomain, setCanvasSubdomain] = useState(localStorage.getItem('canvasSubdomain') || '');

  useEffect(() => {
    console.log('Current token:', token);
    console.log('Current subdomain:', canvasSubdomain);
    if (token && canvasSubdomain) {
      fetchData();
    }
  }, [isLoggedIn, token, canvasSubdomain]);

  const fetchData = async () => {
    if (!isLoggedIn) return;
    try {
      console.log('Fetching data with token:', token);
      console.log('Using subdomain:', canvasSubdomain);
      const [coursesResponse, gradesResponse] = await Promise.all([
        axios.get('/api/courses', { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Canvas-Subdomain': canvasSubdomain
          } 
        }),
        axios.get('/api/grades', { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Canvas-Subdomain': canvasSubdomain
          } 
        })
      ]);
      setCourses(coursesResponse.data);
      setGrades(gradesResponse.data);

      // Load visible courses from cookies
      const savedVisibleCourses = Cookies.get('visibleCourses');
      if (savedVisibleCourses) {
        setVisibleCourses(JSON.parse(savedVisibleCourses));
      } else {
        // If no cookie exists, set all courses to visible
        const initialVisibleCourses = {};
        coursesResponse.data.forEach(course => {
          initialVisibleCourses[course.id] = true;
        });
        setVisibleCourses(initialVisibleCourses);
        // Save initial state to cookie
        Cookies.set('visibleCourses', JSON.stringify(initialVisibleCourses), { expires: 365 });
      }

      // Load sections from cookies
      const savedSections = Cookies.get('sections');
      if (savedSections) {
        setSections(JSON.parse(savedSections));
      }

      // Load course names from cookies
      const savedCourseNames = Cookies.get('courseNames');
      if (savedCourseNames) {
        setCourseNames(JSON.parse(savedCourseNames));
      } else {
        // If no cookie exists, set initial course names
        const initialCourseNames = {};
        coursesResponse.data.forEach(course => {
          initialCourseNames[course.id] = course.name;
        });
        setCourseNames(initialCourseNames);
        // Save initial state to cookie
        Cookies.set('courseNames', JSON.stringify(initialCourseNames), { expires: 365 });
      }
    } catch (error) {
      console.error('Error fetching data:', error.response?.status, error.response?.data);
      setError(`Error fetching data: ${error.response?.data?.message || error.message}`);
    }
  };

  const toggleCourseVisibility = (courseId) => {
    setVisibleCourses(prev => {
      const updated = {
        ...prev,
        [courseId]: !prev[courseId]
      };
      // Save to cookie immediately after updating state
      Cookies.set('visibleCourses', JSON.stringify(updated), { expires: 365 });
      return updated;
    });
  };

  const addSection = () => {
    if (newSectionName.trim()) {
      setSections(prevSections => {
        const updatedSections = [...prevSections, { name: newSectionName.trim(), courses: [] }];
        Cookies.set('sections', JSON.stringify(updatedSections), { expires: 365 });
        return updatedSections;
      });
      setNewSectionName('');
    }
  };

  const removeSection = (index) => {
    setSections(prevSections => {
      const updatedSections = prevSections.filter((_, i) => i !== index);
      Cookies.set('sections', JSON.stringify(updatedSections), { expires: 365 });
      return updatedSections;
    });
  };

  const addCourseToSection = (sectionIndex, courseId) => {
    setSections(prevSections => {
      const newSections = [...prevSections];
      const courseIdNumber = Number(courseId);
      if (!newSections[sectionIndex].courses.includes(courseIdNumber)) {
        newSections[sectionIndex].courses.push(courseIdNumber);
        Cookies.set('sections', JSON.stringify(newSections), { expires: 365 });
      }
      return newSections;
    });
  };

  const removeCourseFromSection = (sectionIndex, courseId) => {
    setSections(prevSections => {
      const newSections = [...prevSections];
      newSections[sectionIndex].courses = newSections[sectionIndex].courses.filter(id => id !== courseId);
      Cookies.set('sections', JSON.stringify(newSections), { expires: 365 });
      return newSections;
    });
  };

  const getColorForGrade = (grade) => {
    if (grade === 'N/A') return '#444';
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade)) return '#444';
    
    // Clamp the grade between 0 and 100
    const clampedGrade = Math.max(0, Math.min(100, numGrade));
    
    let hue, saturation, lightness;
    
    if (clampedGrade >= GRADE_THRESHOLDS.GREEN) {
      hue = 120; // Green
    } else if (clampedGrade >= GRADE_THRESHOLDS.YELLOW) {
      // Transition from Green to Yellow
      hue = 120 - (60 * (GRADE_THRESHOLDS.GREEN - clampedGrade) / (GRADE_THRESHOLDS.GREEN - GRADE_THRESHOLDS.YELLOW));
    } else if (clampedGrade >= GRADE_THRESHOLDS.ORANGE) {
      // Transition from Yellow to Orange
      hue = 60 - (30 * (GRADE_THRESHOLDS.YELLOW - clampedGrade) / (GRADE_THRESHOLDS.YELLOW - GRADE_THRESHOLDS.ORANGE));
    } else if (clampedGrade >= GRADE_THRESHOLDS.RED) {
      // Transition from Orange to Red
      hue = 30 - (30 * (GRADE_THRESHOLDS.ORANGE - clampedGrade) / (GRADE_THRESHOLDS.ORANGE - GRADE_THRESHOLDS.RED));
    } else {
      hue = 0; // Red
    }
    
    saturation = 100;
    lightness = 40;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const startEditingCourse = (courseId, currentName) => {
    setEditingCourse(courseId);
    setEditedCourseName(currentName);
  };

  const saveEditedCourseName = () => {
    if (editingCourse && editedCourseName.trim()) {
      setCourseNames(prev => {
        const updated = { ...prev, [editingCourse]: editedCourseName.trim() };
        Cookies.set('courseNames', JSON.stringify(updated), { expires: 365 });
        return updated;
      });
      setEditingCourse(null);
      setEditedCourseName('');
    }
  };

  const handleLogin = (enteredToken, enteredSubdomain) => {
    setToken(enteredToken);
    setCanvasSubdomain(enteredSubdomain);
    Cookies.set('token', enteredToken, { expires: 7 });
    localStorage.setItem('canvasSubdomain', enteredSubdomain);
    setIsLoggedIn(true);
    setError('');
    fetchData();
  };

  const handleLogout = () => {
    setToken('');
    Cookies.remove('token');
    setIsLoggedIn(false);
    // Clear user data
    setCourses([]);
    setGrades({});
    setVisibleCourses({});
    setSections([]);
    setCourseNames({});
    setError(''); // Clear any errors on logout
  };

  const testDirectApiCall = async () => {
    try {
      const response = await axios.get(`https://${canvasSubdomain}.instructure.com/api/v1/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Direct API call result:', response.data);
    } catch (error) {
      console.error('Direct API call error:', error.response?.status, error.response?.data);
    }
  };

  const toggleSettings = () => setShowSettings(!showSettings);

  return (
    <div className="App">
      <h1>My Grades</h1>
      {error && <div className="error-message">{error}</div>}
      {isLoggedIn ? (
        <>
          <button className="settings-button" onClick={toggleSettings}>
            <Settings size={20} />
          </button>

          {showSettings && (
            <div className="settings-menu">
              <div className="settings-header">
                <h2>Settings</h2>
                <button className="close-button" onClick={() => setShowSettings(false)}>
                  <X size={24} color="#ffffff" />
                </button>
              </div>
              <div className="settings-content">
                <div className="settings-section">
                  <h3>Toggle Visible Courses</h3>
                  <div className="course-list">
                    {courses.map(course => (
                      <div key={course.id} className="course-item">
                        <input
                          type="checkbox"
                          id={`course-${course.id}`}
                          checked={visibleCourses[course.id]}
                          onChange={() => toggleCourseVisibility(course.id)}
                          className="course-checkbox"
                        />
                        <label htmlFor={`course-${course.id}`} className="course-name">
                          {courseNames[course.id] || course.name}
                        </label>
                        <button 
                          className="edit-button" 
                          onClick={() => startEditingCourse(course.id, courseNames[course.id] || course.name)}
                          aria-label="Edit course name"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Manage Sections</h3>
                  <div className="add-section">
                    <input
                      type="text"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="Enter new section name"
                      className="section-input"
                    />
                    <button onClick={addSection} className="add-section-button">
                      <Plus size={16} /> Add
                    </button>
                  </div>
                  {sections.map((section, index) => (
                    <div key={index} className="section-manager">
                      <h4>{section.name}</h4>
                      <button onClick={() => removeSection(index)}>Remove</button>
                      <select 
                        value="" 
                        onChange={(e) => {
                          if (e.target.value) {
                            addCourseToSection(index, e.target.value);
                            e.target.value = ""; // Reset the select after adding
                          }
                        }}
                      >
                        <option value="">Add course</option>
                        {courses.filter(course => !section.courses.includes(course.id)).map(course => (
                          <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                      </select>
                      <ul>
                        {section.courses.map(courseId => {
                          const course = courses.find(c => c.id === courseId);
                          return course ? (
                            <li key={courseId}>
                              {course.name}
                              <button onClick={() => removeCourseFromSection(index, courseId)}><X size={16} /></button>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                className="settings-menu-item logout" 
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
          {sections.map((section, index) => {
            const visibleCoursesInSection = section.courses.filter(courseId => visibleCourses[courseId]);
            if (visibleCoursesInSection.length === 0) return null;
            return (
              <div key={index} className="section">
                <h2>{section.name}</h2>
                <div className="course-grid">
                  {visibleCoursesInSection.map(courseId => {
                    const course = courses.find(c => c.id === courseId);
                    return course ? (
                      <div key={course.id} className="course-card">
                        <h3>{courseNames[course.id] || course.name}</h3>
                        <div 
                          className="grade-box"
                          style={{ backgroundColor: getColorForGrade(grades[course.id]) }}
                        >
                          {grades[course.id] === 'N/A' ? 'N/A? Not A?' : (grades[course.id] || 'N/A')}
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            );
          })}
          {(() => {
            const unsectionedCourses = courses.filter(course => 
              visibleCourses[course.id] && 
              !sections.some(section => section.courses.includes(course.id))
            );
            if (unsectionedCourses.length === 0) return null;
            return (
              <div className="section">
                <h2>Unsectioned Courses</h2>
                <div className="course-grid">
                  {unsectionedCourses.map(course => (
                    <div key={course.id} className="course-card">
                      <h3>{courseNames[course.id] || course.name}</h3>
                      <div 
                        className="grade-box"
                        style={{ backgroundColor: getColorForGrade(grades[course.id]) }}
                      >
                        {grades[course.id] === 'N/A' ? 'N/A? Not A?' : (grades[course.id] || 'N/A')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      ) : (
        <div className="login-screen">
          <div className="login-card">
            <p className="login-description">
              Sign in with your Canvas API token to view your grades.
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleLogin(e.target.token.value, e.target.canvasSubdomain.value);
            }} className="login-form">
              <div className="input-group">
                <input
                  type="password"
                  id="token"
                  name="token"
                  placeholder="Canvas API Token"
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  id="canvasSubdomain"
                  name="canvasSubdomain"
                  placeholder="Canvas Subdomain (e.g., psu)"
                  required
                  defaultValue={canvasSubdomain}
                />
              </div>
              <button type="submit" className="login-button">
                <LogIn size={20} />
                <span>Sign In</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;