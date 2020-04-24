/*
This page exists to demonstrate front-end routing capabilities in a 
containerized app
*/
import React from 'react';
import { Link } from 'react-router-dom';

export default () => {
  return (
    <div>
      I'm some other page!
      <Link to="/">Go back home</Link>
    </div>
  )
}