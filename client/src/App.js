import "./App.css";
import Subject from "./Subject";
import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [subjects, setSubjects] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showDeleteSubject, setShowDeleteSubject] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const toggleDashboard = (event) => {
    setShowDashboard(prevState => !prevState);
    setShowAddSubject(false);
    setShowDeleteSubject(false);
  };

  const toggleAddSubject = (event) => {
    event.preventDefault();
    setShowAddSubject(!showAddSubject);
    setShowDeleteSubject(false);
  };

  const toggleDeleteSubject = (event) => {
    event.preventDefault();
    setShowDeleteSubject(!showDeleteSubject);
    setShowAddSubject(false);
  };

  const handleAddSubject = (event) => {
    event.preventDefault();
    const subjectName = event.target.newSub.value;
    axios.post(`${API_URL}/add`, { name: subjectName })
    .then(response => {
      console.log('Response from Server:', response.data);
      fetchSubjects();
      setShowAddSubject(false);
      setShowDashboard(false);
    })
    .catch(error => {
      console.error('Error sending data:', error);
    });
  };

  const handleDeleteSubject = (event) => {
    event.preventDefault();
    const subjectName = event.target.deleteSub.value;
    axios.delete(`${API_URL}/delete`, { data: { name: subjectName } })
    .then(response => {
      console.log('Subject deleted:', response.data);
      fetchSubjects();
      setShowDeleteSubject(false);
      setShowDashboard(false);
    })
    .catch(error => {
      console.error('Error deleting subject:', error);
    });
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = () => {
    axios
      .get(`${API_URL}/subjects`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setSubjects(response.data);
        } else {
          console.error("Subjects data is not an array");
        }
      })
      .catch((error) => {
        console.error("Error fetching subjects:", error);
      });
  };

  return (
    <div className="App">
      <header>Attendance Tracker</header>
      <button className="edit" onClick={toggleDashboard}>Edit Subjects</button>
      <div id="dash" className="v-container">
        {showDashboard && (
          <dashboard>
            <button className="add-sub" onClick={toggleAddSubject}>Add Subject</button>
            <button className="delete-sub" onClick={toggleDeleteSubject}>Delete Subject</button>
          </dashboard>
        )}
      </div>
      <div id="edit-sub" className="v-container">
        {showAddSubject && (
          <form id="add-subject-form" onSubmit={handleAddSubject}>
            <label>Enter New Subject</label>
            <input type="text" name="newSub" required />
            <button type="submit">Done</button>
          </form>
        )}
        {showDeleteSubject && (
          <form id="delete-subject-form" onSubmit={handleDeleteSubject}>
            <label>Enter name of Subject to be deleted</label>
            <input type="text" name="deleteSub" required />
            <button type="submit">Done</button>
          </form>
        )}
      </div>
      <h1>Subjects List</h1>
      <container>
      {subjects &&
        subjects.map((subject) => (
          <Subject
            key={subject._id}
            subject={subject}
            setSubjects={setSubjects}
          />
        ))}
      </container>
    </div>
  );
}

export default App;
