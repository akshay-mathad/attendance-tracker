import React, { useRef, useEffect } from "react";
import Chart from 'chart.js/auto';
import axios from "axios";
import "./Subject.css";

const Subject = ({ subject, setSubjects }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Cleanup function to destroy any existing chart
    const chartInstance = chartRef.current?.chart;
    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = chartRef.current?.getContext('2d');
    if (ctx) {
      const totalClasses = subject.attended + subject.missed;

      const newChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Attended', 'Missed'],
          datasets: [{
            data: [subject.attended, subject.missed],
            backgroundColor: [
              (subject.attended / (subject.attended + subject.missed)) * 100 < 75 ? '#ff0000' : '#9dbe90', // Attended
              '#36a2eb'  // Missed
            ],
            hoverOffset: 4,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const label = tooltipItem.label || '';
                  const value = tooltipItem.raw;
                  const percentage = ((value / totalClasses) * 100).toFixed(2);
                  return `${label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        },
      });

      // Attach chart instance to canvas element
      chartRef.current.chart = newChart;
    }

    // Cleanup function to remove chart on component unmount
    return () => {
      const chartInstance = chartRef.current?.chart;
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [subject.attended, subject.missed]);

  const handleMissed = () => {
    const subName = subject.name;
    axios.post("http://localhost:5000/missed", { name: subName })
      .then(() => {
        axios.get("http://localhost:5000/subjects")
          .then((response) => {
            if (Array.isArray(response.data)) {
              setSubjects(response.data);
            } else {
              console.error("Subjects data is not an array");
            }
          })
          .catch((error) => {
            console.error("Error fetching updated subjects:", error);
          });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleAttended = () => {
    const subName = subject.name;
    axios.post("http://localhost:5000/attended", { name: subName })
      .then(() => {
        axios.get("http://localhost:5000/subjects")
          .then((response) => {
            if (Array.isArray(response.data)) {
              setSubjects(response.data);
            } else {
              console.error("Subjects data is not an array");
            }
          })
          .catch((error) => {
            console.error("Error fetching updated subjects:", error);
          });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  // Function to format the timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();  // Formats the date and time as per locale
  };

  return (
    <div className="hor-container">
      <h3>{subject.name}</h3>
      <button className="btn" onClick={handleMissed}>Missed: {subject.missed}</button>
      <button className="btn" onClick={handleAttended}>Attended: {subject.attended}</button>
      <label>Total: {subject.total}</label>
      <canvas ref={chartRef} width="200" height="200"></canvas>

      {/* Display last updated time */}
      <p className="last-updated">
        Last Updated: {formatDate(subject.lastUpdated)}
      </p>
    </div>
  );
};

export default Subject;
