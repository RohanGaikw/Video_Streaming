import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function VideoUpload() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoName, setVideoName] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videos, setVideos] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch('https://video-streaming-git-main-rohangaikws-projects.vercel.app/api/videos')
      .then((res) => res.json())
      .then((data) => setVideos(data))
      .catch((err) => console.error('Error fetching videos:', err));
  }, []);

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoFile || !videoName || !videoDescription) {
      alert('Please provide a video file, name, and description.');
      return;
    }

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('name', videoName);
    formData.append('description', videoDescription);

    const response = await fetch('https://video-streaming-git-main-rohangaikws-projects.vercel.app/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const newVideo = await response.json();
      setVideos([...videos, newVideo]);
      setVideoFile(null);
      setVideoName('');
      setVideoDescription('');
    } else {
      alert('Error uploading video');
    }
  };

  const handleDelete = async (id) => {
    const response = await fetch(`https://video-streaming-git-main-rohangaikws-projects.vercel.app/api/videos/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setVideos(videos.filter((video) => video._id !== id));
    } else {
      alert('Error deleting video');
    }
  };

  return (
    <div className="container-fluid px-3" style={{ background: 'linear-gradient(to right, #8e44ad, #ff66b2)', minHeight: '50vh', padding: '20px' }}>
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          <div className="card p-4 shadow">
            <h2 className="text-center mb-4">Upload a Video</h2>
            <form onSubmit={handleVideoUpload} className="d-flex flex-column gap-3">
              <input type="file" className="form-control" onChange={(e) => setVideoFile(e.target.files[0])} accept="video/*" />
              <input type="text" className="form-control" placeholder="Video Name" value={videoName} onChange={(e) => setVideoName(e.target.value)} />
              <textarea className="form-control" placeholder="Video Description" value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)} />
              <button type="submit" className="btn btn-primary w-100">Upload Video</button>
            </form>
          </div>
        </div>
      </div>

      {videos.length > 0 && (
        <div className="mt-5">
          <h3 className="text-center">Uploaded Videos</h3>
          <div className="row">
            {videos.map((video) => (
              <div key={video._id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                <div className="card p-3 shadow">
                  <h4>{video.name}</h4>
                  <p>{video.description}</p>
                  <video width="100%" controls>
                    <source src={video.url} type="video/mp4" />
                  </video>
                  <div className="d-flex justify-content-between mt-3">
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(video._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoUpload;
