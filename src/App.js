import React from 'react';
import './App.css';
import VideoPlayer from './components/VideoPlayer';
import movie from './assets/movie.mp4';
import moviePoster from './assets/poster.jpg';

function App() {
  return (
    <VideoPlayer video={ movie } videoTitle="Paints" videoPoster={ moviePoster } videoType="video/mp4" style={ style }  />
  );
}

const style = {
  width: '30%',
  height: 'auto'
};

export default App;
