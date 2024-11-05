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
  faceapi.nets.faceExpressionNet.loadFromUri('./models'),
  faceapi.nets.ageGenderNet.loadFromUri('./models') // Load the age and gender model
]).then(analyzeImage);

async function analyzeImage() {
  if (!imageDataUrl) return;

  // Wait until the image has loaded
  await capturedImage.decode();

  // Set canvas dimensions to match the image
  analysisCanvas.width = capturedImage.width;
  analysisCanvas.height = capturedImage.height;

  // Detect emotions, age, and gender in the image
  const detections = await faceapi.detectAllFaces(capturedImage, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions()
    .withAgeAndGender();
  
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

  // Analyze detected emotions, age, and gender, then show recommendations
  if (detections.length > 0) {
    const { expressions, age, gender } = detections[0];
    await validateEmotion(expressions);
    displayRecommendations(expressions, age, gender);
  }
}

// Fungsi untuk memvalidasi emosi pengguna
async function validateEmotion(emotions) {
  const dominantEmotion = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
  const confirmation = confirm(`Do you feel ${dominantEmotion}?`);
  
  // Simpan jawaban ke localStorage
  localStorage.setItem('emotionConfirmation', confirmation ? 'yes' : 'no');

  // Panggil fungsi untuk memberikan solusi dan refleksi berdasarkan konfirmasi
  provideSolutionAndReflection(dominantEmotion);
}

// Fungsi untuk memberikan solusi dan refleksi
function provideSolutionAndReflection(emotion) {
  const selfCareTips = document.getElementById('selfCareTips');
  const relaxationTechniques = document.getElementById('relaxationTechniques');

  // Solusi berdasarkan emosi
  switch (emotion) {
    case 'happy':
      selfCareTips.innerHTML = ` Enjoy this moment by doing activities you love, like hanging out with friends or exercising.`;
      relaxationTechniques.innerHTML = `Try dancing or listening to cheerful music.`;
      break;
    case 'sad':
      selfCareTips.innerHTML = `Take time for yourself, perhaps by journaling or talking to a close friend.`;
      relaxationTechniques.innerHTML = `Relaxation Techniques: Try meditating or watching an entertaining movie.`;
      break;
    case 'angry':
      selfCareTips.innerHTML = `Try to express your feelings in a healthy way, like exercising or talking to someone.`;
      relaxationTechniques.innerHTML = `Relaxation Techniques: Try deep breathing techniques or going for a walk outside.`;
      break;
    case 'surprised':
      selfCareTips.innerHTML = ` Take time to reflect and understand your feelings.`;
      relaxationTechniques.innerHTML = `Relaxation Techniques: Try doing fun and surprising activities, like trying a new hobby.`;
      break;
    default:
      selfCareTips.innerHTML = `Try doing activities that can improve your mood.`;
      relaxationTechniques.innerHTML = `Relaxation Techniques: Try yoga or deep breathing techniques.`;
  }

  selfCareTips.style.display = 'block'; // Tampilkan tips perawatan diri
  relaxationTechniques.style.display = 'block'; // Tampilkan teknik relaksasi
}

function displayRecommendations(emotions, age, gender) {
  // Find the emotion with the highest probability
  const dominantEmotion = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);

  // Select DOM elements to display data
  const emotionName = document.getElementById('emotionName');
  const ageGenderDisplay = document.getElementById('ageGenderDisplay'); // Add element for age and gender

  // Clear previous buttons

  // Display age and gender
  ageGenderDisplay.textContent = `Age: ${Math.round(age)} | Gender: ${gender}`;

  // Display recommendations based on dominant emotion
  if (dominantEmotion === 'happy') {
    emotionName.textContent = 'Happy 😁';
  } else if (dominantEmotion === 'sad') {
    emotionName.textContent = 'Sad 😔';
  } else if (dominantEmotion === 'angry') {
    emotionName.textContent = 'Angry😡';
  } else if (dominantEmotion === 'surprised') {
    emotionName.textContent = 'Surprised😱';
  } else {
    emotionName.textContent = 'Neutral 🙂';
  }

  // Tampilkan SweetAlert untuk chat dengan AI atau bermain game setelah 5 detik
  setTimeout(() => {
    let alertTitle = 'Stimulate Your Emotion';
    let alertText = 'Would you like to chat with our AI or Stimulate Emotion by Videos?';

    // Sesuaikan teks berdasarkan emosi dominan
    if (dominantEmotion === 'happy') {
      alertText = 'You seem happy! Would you like to chat with our AI or play a game?';
    } else if (dominantEmotion === 'sad') {
      alertText = 'You seem sad. Would you like to chat with our AI or play a game to lift your spirits?';
    } else if (dominantEmotion === 'angry') {
      alertText = 'You seem angry. Would you like to chat with our AI or play a game to relax?';
    } else if (dominantEmotion === 'surprised') {
      alertText = 'You seem surprised! Would you like to chat with our AI or play a game?';
    } else {
      alertText = 'You seem neutral. Would you like to chat with our AI or play a game?';
    }

    Swal.fire({
      title: alertTitle,
      text: alertText,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Chat with Karina',
      cancelButtonText: 'Stimulate Emotion'
    }).then((result) => {
      if (result.isConfirmed) {
        // Logika untuk memulai chat dengan AI
        startChatWithAI(); // Ganti dengan fungsi yang sesuai untuk memulai chat
      } else {
        // Logika untuk memulai permainan
        startVideo(dominantEmotion); // Ganti dengan fungsi yang sesuai untuk memulai permainan
      }
    });
  }, 5000); // 5000 ms = 5 detik
}

function startVideo(dominantEmotion) {
  let videoUrl;

  // Daftar video untuk setiap emosi
  const videos = {
    happy: ['./videos/happy/happy1.mp4', './videos/happy/happy2.mp4', './videos/happy/happy3.mp4'],
    sad: ['./videos/sad/sad1.mp4', './videos/sad/sad1.mp4'],
    angry: ['./videos/angry1.MOV', './videos/angry2.MOV', './videos/angry3.MOV'],
    surprised: ['./videos/surprised1.MOV', './videos/surprised2.MOV', './videos/surprised3.MOV'],
    neutral: ['./videos/neutral1.MOV', './videos/neutral2.MOV', './videos/neutral3.MOV']
  };

  // Tentukan URL video berdasarkan emosi dominan secara acak
  if (videos[dominantEmotion]) {
    const randomIndex = Math.floor(Math.random() * videos[dominantEmotion].length);
    videoUrl = videos[dominantEmotion][randomIndex];
  } else {
    videoUrl = videos['neutral'][0]; // Default ke video netral jika emosi tidak dikenali
  }

  // Memutar video menggunakan elemen video HTML
  const videoPlayer = document.createElement('video');
  videoPlayer.src = videoUrl;
  videoPlayer.controls = true; // Menampilkan kontrol video
  videoPlayer.autoplay = true; // Memutar video secara otomatis
  videoPlayer.loop = true; // Mengatur video untuk looping
  videoPlayer.style.width = '100%'; // Mengatur lebar video
  videoPlayer.style.height = '100%'; // Mengatur tinggi video
  videoPlayer.style.position = 'fixed'; // Mengatur posisi video
  videoPlayer.style.top = '0'; // Mengatur posisi atas
  videoPlayer.style.left = '0'; // Mengatur posisi kiri
  videoPlayer.style.zIndex = '9999'; // Mengatur z-index agar video di atas elemen lain

  // Menambahkan video ke body
  document.body.appendChild(videoPlayer);
  videoPlayer.requestFullscreen(); // Meminta tampilan layar penuh

  let videoDuration = 30; // Durasi video dalam detik

  // Tentukan alertTitle dan alertText sebelum digunakan
  let alertTitle = 'Stimulate Your Emotion';
  let alertText = 'Would you like to chat with our AI?';

  // Timer untuk menghentikan video setelah 4 detik
  setTimeout(() => {
    // Menghentikan video
    videoPlayer.remove();

    // Tampilkan SweetAlert setelah video selesai
    Swal.fire({
      title: alertTitle,
      text: alertText,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Chat with Karina',
      cancelButtonText: 'No'
    }).then((result) => {

      if (result.isConfirmed) {
        // Logika untuk memulai chat dengan AI
        startChatWithAI(); // Ganti dengan fungsi yang sesuai untuk memulai chat
      } 
    });
  }, videoDuration * 1000); // Timer berdasarkan durasi video

  videoPlayer.play();
  // Memutar video
}

