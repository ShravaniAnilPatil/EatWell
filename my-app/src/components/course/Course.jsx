
import React from 'react';
import Magnet from './Magnet'
import './Course.css'


const Course = ({ id, imgSrc, text, description }) => {
    return (
      <div className='course_wrapper'>
      <div className='magnett'>
        <Magnet padding={50} disabled={false} magnetStrength={15} activeTransition="transform 0.3s ease-out" inactiveTransition="transform 0.5s ease-in-out" wrapperClassName="magnet-wrapper" innerClassName="magnet-inner">
      
      <div className="course" id={id}>
      
      <div className={`${id}a`}>
        <div className={`${id}b`}>
          <img src={imgSrc} alt="Course" />
          <div class="overlay-text">
          <h3>{text}</h3>
          <p>{description}</p>
          </div>
        </div>
      </div>
    
    </div>
      
      </Magnet>
      </div>
      </div>
      
    );
  };

  export default Course;