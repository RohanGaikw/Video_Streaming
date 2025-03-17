import React, { useState, useEffect } from 'react';
import './VideoList.css';

function VideoList() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Fetch videos from localStorage and log to check
    const storedVideos = JSON.parse(localStorage.getItem('videos')) || [];
    console.log("Stored videos:", storedVideos);
    setVideos(storedVideos);
  }, []);

  return (
    <div>
      <h3>Uploaded Videos</h3>
      {videos.length > 0 ? (
        <ul>
          {videos.map((video, index) => (
            <li key={index}>
              <h4>{video.name}</h4>
              <p>{video.description}</p>
              <video width="300" controls>
                <source src={video.url} type="video/mp4" />
              </video>
            </li>
          ))}
        </ul>
      ) : (
        <p>No videos uploaded yet.</p>
      )}
    </div>
  );
}

export default VideoList;
