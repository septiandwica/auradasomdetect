const video = document.getElementById('video');
const analyzeButton = document.getElementById('analyzeButton');
const canvas = document.getElementById('overlay');

// Load face-api.js models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models')
]).then(startVideo);

// Start video stream
function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.error("Error accessing camera: ", err);
      alert("Unable to access the camera. Please check your permissions then allow the camera."); // Tambahkan peringatan untuk kesalahan
    });
}

video.addEventListener('play', () => {
  // Adjust canvas size to match video size
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  faceapi.matchDimensions(canvas, displaySize);

  // Detect faces and draw bounding boxes every 100ms
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
    
    // Clear previous detections
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Resize detections and draw bounding boxes
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    // Optionally, if you want to draw landmarks (contours) as well
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
  }, 100);
});

// Capture image on button click
analyzeButton.addEventListener('click', async () => {
  const capturedCanvas = document.createElement('canvas');
  capturedCanvas.width = video.videoWidth;
  capturedCanvas.height = video.videoHeight;
  capturedCanvas.getContext('2d').drawImage(video, 0, 0, capturedCanvas.width, capturedCanvas.height);

  // Convert the image to a data URL and store it in localStorage
  const imageDataUrl = capturedCanvas.toDataURL('image/png');
  localStorage.setItem('capturedImage', imageDataUrl);

  // Redirect to analysis page
  window.location.href = 'analysis.html';
});
