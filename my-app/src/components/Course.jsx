import React from 'react';
import '../styles/Course.css';

const Course = ({ id, imgSrc, description }) => {
    return (
      <div className="course" id={id}>
        <div className={`${id}a`}>
          <div className={`${id}b`}>
            <img src={imgSrc} alt="Course" />
            <p>{description}</p>
          </div>
        </div>
      </div>
    );
  };

  export default Course;