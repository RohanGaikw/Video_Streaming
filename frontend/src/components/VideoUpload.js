import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function VideoUpload() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoName, setVideoName] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videos, setVideos] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    const storedVideos = JSON.parse(localStorage.getItem('videos')) || [];
    setVideos(storedVideos);
  }, []);

  const handleVideoUpload = (e) => {
    e.preventDefault();

    if (!videoFile || !videoName || !videoDescription) {
      alert('Please provide a video file, name, and description.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newVideo = {
        name: videoName,
        description: videoDescription,
        url: reader.result,
      };

      let updatedVideos = [...videos];
      if (editingIndex !== null) {
        updatedVideos[editingIndex] = newVideo;
      } else {
        updatedVideos.push(newVideo);
      }

      localStorage.setItem('videos', JSON.stringify(updatedVideos));
      setVideos(updatedVideos);

      setVideoFile(null);
      setVideoName('');
      setVideoDescription('');
      setEditingIndex(null);
    };

    reader.readAsDataURL(videoFile);
  };

  const handleEdit = (index) => {
    const videoToEdit = videos[index];
    setVideoFile(null);
    setVideoName(videoToEdit.name);
    setVideoDescription(videoToEdit.description);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    localStorage.setItem('videos', JSON.stringify(updatedVideos));
    setVideos(updatedVideos);
  };

  return (
    <div className="container-fluid px-3" style={{ background: 'linear-gradient(to right, #8e44ad, #ff66b2)', minHeight: '50vh', padding: '20px' }}>
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          <div className="card p-4 shadow">
            <h2 className="text-center mb-4">Upload a Video</h2>
            <form onSubmit={handleVideoUpload} className="d-flex flex-column gap-3">
              <input type="file" className="form-control" onChange={(e) => setVideoFile(e.target.files[0])} accept="video/*" disabled={editingIndex !== null} />
              <input type="text" className="form-control" placeholder="Video Name" value={videoName} onChange={(e) => setVideoName(e.target.value)} />
              <textarea className="form-control" placeholder="Video Description" value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)} />
              <button type="submit" className="btn btn-primary w-100">{editingIndex !== null ? 'Update Video' : 'Upload Video'}</button>
            </form>
          </div>
        </div>
      </div>

      {videos.length > 0 && (
        <div className="mt-5">
          <h3 className="text-center">Uploaded Videos</h3>
          <div className="row">
            {videos.map((video, index) => (
              <div key={index} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                <div className="card p-3 shadow">
                  <h4>{video.name}</h4>
                  <p>{video.description}</p>
                  <video width="100%" controls>
                    <source src={video.url} type="video/mp4" />
                  </video>
                  <div className="d-flex justify-content-between mt-3">
                    <button className="btn btn-success btn-sm" onClick={() => handleEdit(index)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(index)}>Delete</button>
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
