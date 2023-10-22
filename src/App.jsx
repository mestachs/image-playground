import "react";
import "./App.css";
import { useEffect, useState } from "react";

function applyThreshold(sourceImageData, outputImageData, threshold = 127) {
  const src = sourceImageData.data;

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];

    // thresholding the current value
    const weightedValue = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const v = weightedValue >= threshold ? 255 : 0;
    src[i] = src[i + 1] = src[i + 2] = v;
  }

  return sourceImageData;
}

function applyThreshold2(sourceImageData, threshold = 120) {
  const pixels = sourceImageData.data;

  // Manipulate the pixels (e.g., invert colors)
  for (let i = 0; i < pixels.length; i += 4) {
    const red = pixels[i];
    const green = pixels[i + 1];
    const blue = pixels[i + 2];
    const alpha = pixels[i + 2];

    // Calculate a grayscale value for the pixel
    const grayValue = (red + green + blue) / 3;

    // If the grayscale value is below the threshold, set the pixel to white
    if (grayValue > threshold) {
      pixels[i] = 255;
      pixels[i + 1] = 255;
      pixels[i + 2] = 255;
    }

    /*         generate a negative

pixels[i] = 255 - red;
  pixels[i + 1] = 255 - green;
  pixels[i + 2] = 255 - blue;
  //pixels[i + 3] = 255 - blue;
  */
  }
}

function cleanupImage(imageData) {
  const cleanedData = new ImageData(imageData.width, imageData.height);

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      cleanedData.data[(y * imageData.width + x) * 4] =
        imageData.data[(y * imageData.width + x) * 4];
      cleanedData.data[(y * imageData.width + x) * 4 + 1] =
        imageData.data[(y * imageData.width + x) * 4 + 1];
      cleanedData.data[(y * imageData.width + x) * 4 + 2] =
        imageData.data[(y * imageData.width + x) * 4 + 2];
      cleanedData.data[(y * imageData.width + x) * 4 + 3] =
        imageData.data[(y * imageData.width + x) * 4 + 3];

      // Check if a pixel's RGB values are above a certain threshold
      // You may need to adjust this threshold based on your image
      if (imageData.data[(y * imageData.width + x) * 4] > 120) {
        // Set the cleaned pixel to white
        cleanedData.data[(y * imageData.width + x) * 4] = 255;
        cleanedData.data[(y * imageData.width + x) * 4 + 1] = 255;
        cleanedData.data[(y * imageData.width + x) * 4 + 2] = 255;
        cleanedData.data[(y * imageData.width + x) * 4 + 3] = 255;
      }
    }
  }

  return cleanedData;
}
const maxWidth = 900;
const maxHeight = 900;

function calculateResized(img) {
  // Calculate the image dimensions to fit within the canvas
  let newWidth,
    newHeight = maxWidth;
  if (img.width > img.height) {
    newWidth = maxWidth;
    newHeight = (maxWidth / img.width) * img.height;
  } else {
    newHeight = maxHeight;
    newWidth = (maxHeight / img.height) * img.width;
  }

  // Calculate the position to center the image on the canvas
  const x = (maxWidth - newWidth) / 2;
  const y = (maxHeight - newHeight) / 2;
  return { x, y, newWidth, newHeight };
}

function App() {
  const onImageInputChange = (event) => {
    const imageInput = document.getElementById("imageInput");
    const outputImage = document.getElementById("outputImage");
    const imageCanvas = document.getElementById("imageCanvas");
    const ctx = imageCanvas.getContext("2d");

    const file = imageInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = function () {
        imageCanvas.width = maxWidth; // Set the canvas width
        imageCanvas.height = maxHeight; // Set the canvas height

        const { x, y, newWidth, newHeight } = calculateResized(img);

        ctx.drawImage(img, x, y, newWidth, newHeight);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);

        outputImage.src = imageCanvas.toDataURL();

        applyThreshold2(imageData);

        ctx.putImageData(cleanupImage(cleanupImage(imageData)), 0, 0);
      };
    };

    reader.readAsDataURL(file);
  };

  const [pixelInfo, setPixelInfo] = useState();

  useEffect(() => {
    const video = document.getElementById("video");
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error(`An error occurred: ${err}`);
      });
  }, []);

  function takePhoto() {
    const outputImage = document.getElementById("outputImage");

    const imageCanvas = document.getElementById("imageCanvas");
    const ctx = imageCanvas.getContext("2d");

    imageCanvas.width = maxWidth; // Set the canvas width
    imageCanvas.height = maxHeight; // Set the canvas height

    ctx.drawImage(video, 0, 0, maxWidth, maxHeight);

    outputImage.src = imageCanvas.toDataURL("image/png");

    const imageData = ctx.getImageData(0, 0, maxWidth, maxHeight);

    applyThreshold2(imageData);

    ctx.putImageData(cleanupImage(imageData), 0, 0);
  }

  function handleMouseHover(event) {
    const e = event.nativeEvent;
    const imageCanvas = document.getElementById("imageCanvas");
    const ctx = imageCanvas.getContext("2d", { willReadFrequently: true });

    const x = e.offsetX;
    const y = e.offsetY;
    const pixel = ctx.getImageData(x, y, 1, 1).data;

    const grayValue = (pixel[0] + pixel[1] + pixel[2]) / 3;

    // Display the RGB values of the pixel under the mouse
    setPixelInfo({
      text: `RGB: ${pixel[0]}, ${pixel[1]}, ${pixel[2]}, alpha: ${pixel[3]}, grayValue ${grayValue}`,
      red: pixel[0],
      green: pixel[1],
      blue: pixel[2],
      alpha: pixel[3],
      grayValue: grayValue,
    });
  }

  return (
    <div>
      <input
        type="file"
        id="imageInput"
        accept="image/*"
        onChange={onImageInputChange}
      />
      <br></br>
      <img id="outputImage" />

      <canvas id="imageCanvas" onMouseMove={handleMouseHover}></canvas>
      <div>{pixelInfo && pixelInfo.text}</div>

      <div className="camera">
        <video id="video">Video stream not available.</video>
        <button id="startbutton" onClick={takePhoto}>
          Take photo
        </button>
      </div>
    </div>
  );
}

export default App;
