const capturedImage = document.getElementById('capturedImage');
const analysisCanvas = document.getElementById('analysisCanvas');
const recommendationDiv = document.getElementById('recommendation');
const buttonContainer = document.getElementById('buttonContainer');

// Load the image from localStorage
const imageDataUrl = localStorage.getItem('capturedImage');
if (imageDataUrl) {
  capturedImage.src = imageDataUrl;
}

// Load face-api models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(analyzeImage);

async function analyzeImage() {
  if (!imageDataUrl) return;

  // Wait until the image has loaded
  await capturedImage.decode();

  // Set canvas dimensions to match the image
  analysisCanvas.width = capturedImage.width;
  analysisCanvas.height = capturedImage.height;

  // Detect emotions in the image
  const detections = await faceapi.detectAllFaces(capturedImage, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions();
  
  const displaySize = { width: capturedImage.width, height: capturedImage.height };
  faceapi.matchDimensions(analysisCanvas, displaySize);

  // Resize detections to fit the display size
  const resizedDetections = faceapi.resizeResults(detections, displaySize);

  // Clear canvas and draw the analysis results directly over the image
  const context = analysisCanvas.getContext('2d');
  context.clearRect(0, 0, analysisCanvas.width, analysisCanvas.height);
  faceapi.draw.drawDetections(analysisCanvas, resizedDetections);
  faceapi.draw.drawFaceLandmarks(analysisCanvas, resizedDetections);
  faceapi.draw.drawFaceExpressions(analysisCanvas, resizedDetections);

  // Analyze detected emotions and show recommendations
  if (detections.length > 0) {
    const emotions = detections[0].expressions;
    displayRecommendations(emotions);
  }
}

function displayRecommendations(emotions) {
  // Find the emotion with the highest probability
  const dominantEmotion = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);

  // Clear previous recommendations and buttons
  recommendationDiv.innerHTML = '';
  buttonContainer.innerHTML = '';

  // Create recommendation based on dominant emotion
  let message = '';
  let buttonsHtml = '';
  if (dominantEmotion === 'happy') {
    message = 'You seem happy! Here are some activities for you:';
    buttonsHtml = `
      <button onclick="window.location.href='../games/index.html'">Play a Game</button>
      <button onclick="alert('Connecting to AI chat...')">Talk with AI</button>
    `;
  } else if (dominantEmotion === 'sad') {
    message = 'Feeling down? Try these activities to cheer up:';
    buttonsHtml = `
      <button onclick="alert('Connecting to AI chat...')">Talk with AI</button>
      <button onclick="window.location.href='../games/index.html'">Play a Relaxing Game</button>
    `;
  } else if (dominantEmotion === 'angry') {
    message = 'It seems like you might be frustrated. Try these activities to calm down:';
    buttonsHtml = `
      <button onclick="alert('Connecting to AI chat...')">Talk with AI</button>
      <button onclick="alert('Playing calming music...')">Listen to Music</button>
    `;
  } else if (dominantEmotion === 'surprised') {
    message = 'You seem surprised! Here are some fun activities for you:';
    buttonsHtml = `
      <button onclick="window.location.href='../games/index.html'">Discover a New Game</button>
      <button onclick="alert('Connecting to AI chat...')">Talk with AI</button>
    `;
  } else {
    message = 'Here are some activities you might enjoy:';
    buttonsHtml = `
      <button onclick="window.location.href='../games/index.html'">Play a Game</button>
      <button onclick="alert('Connecting to AI chat...')">Talk with AI</button>
    `;
  }

  // Display the recommendation message
  recommendationDiv.innerHTML = `<p>${message}</p>`;
  buttonContainer.innerHTML = buttonsHtml;
}
