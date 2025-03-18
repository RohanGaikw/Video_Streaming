import React, { useState, useEffect } from 'react';
import './VideoList.css';

function VideoList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://video-streaming-liard.vercel.app/api/videos')
      .then(response => response.json())
      .then(data => {
        console.log("Fetched videos:", data);
        setVideos(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching videos:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="video-list-container">
      <h3>Uploaded Videos</h3>
      {loading ? (
        <p>Loading videos...</p>
      ) : videos.length > 0 ? (
        <ul className="video-list">
          {videos.map((video) => (
            <li key={video._id} className="video-item">
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
