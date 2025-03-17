import React, { useState, useEffect } from 'react';
import './VideoList.css';

function VideoList() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Fetch videos from backend API
    fetch('https://video-streaming-git-main-rohangaikws-projects.vercel.app/api/videos')
      .then(response => response.json())
      .then(data => {
        console.log("Fetched videos:", data);
        setVideos(data);
      })
      .catch(error => console.error("Error fetching videos:", error));
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
