# ROLE

You are a Senior AI Engineer, Full Stack Developer, UI/UX Designer, and ML Deployment Engineer.

Build a complete **production-ready Autoencoder Web Application** using the **Google Colab notebook (.ipynb)** that I upload. The notebook already contains the trained Autoencoder model trained on the MNIST grayscale handwritten digit dataset.

Your responsibility is to:
- Read and understand the uploaded Colab notebook.
- Extract the trained model, preprocessing pipeline, encoder, decoder, and inference logic.
- Reuse the exact architecture from the notebook.
- Build a beautiful, modern, responsive web application around it.
- Make the project clean, modular, scalable, and production-ready.
- Ensure it can be deployed successfully.

---

# IMPORTANT REQUIREMENTS

The uploaded Google Colab notebook is the **single source of truth**.

Do NOT redesign or retrain the model.

Use exactly:
- Model architecture
- Input shape
- Image preprocessing
- Image normalization
- Encoder
- Decoder
- Reconstruction pipeline
- Prediction logic

If the notebook does not save the trained model, automatically add the required code to export the trained models.

Example:

model.save("autoencoder.h5")
encoder.save("encoder.h5")
decoder.save("decoder.h5")

Use these exported models inside the web application.

---

# PROJECT GOAL

Develop an AI-powered Autoencoder Web Application where users can:

• Upload an image
• Draw a handwritten digit
• Automatically preprocess the image exactly like the notebook
• Encode the image
• Decode (reconstruct) the image
• Compare Original vs Reconstructed
• Display reconstruction metrics
• Visualize the latent space
• Download the reconstructed image

The application should have a premium AI-product appearance with smooth animations and a modern user experience.

---

# TECHNOLOGY STACK

Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Icons
- React Dropzone
- Axios
- Chart.js
- React Router

Backend
- Python
- Flask
- TensorFlow
- Keras
- NumPy
- Pillow
- OpenCV

Deployment

Frontend:
- Netlify

Backend:
- Flask API

If TensorFlow inference cannot run directly on Netlify, automatically convert the trained model into TensorFlow.js and execute inference completely in the browser.

If TensorFlow.js conversion is not possible, provide a Flask backend and deployment instructions.

---

# PROJECT STRUCTURE

AutoEncoder-WebApp/

frontend/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── package.json
└── vite.config.js

backend/
│
├── app.py
├── preprocessing.py
├── requirements.txt
├── routes/
├── model/
│   ├── autoencoder.h5
│   ├── encoder.h5
│   └── decoder.h5

README.md
netlify.toml
.gitignore
.env.example

---

# LANDING PAGE

Create a premium landing page with:

- AI-themed hero section
- Animated neural network background
- Glassmorphism cards
- Gradient design
- Typing animation
- Floating AI particles
- Autoencoder workflow illustration
- Responsive navigation bar
- Dark/Light mode toggle
- Smooth scrolling
- Professional footer
- Mobile responsive layout

---

# IMAGE UPLOAD

Allow users to:

- Drag and Drop
- Browse files
- Upload PNG
- Upload JPG
- Upload JPEG

Show:

- Image preview
- Replace image
- Remove image
- File validation
- Upload progress
- Error handling

---

# DRAW DIGIT

Provide a handwriting canvas with:

- Brush tool
- Eraser
- Clear canvas
- Undo
- Redo
- Adjustable brush size
- Automatic conversion to 28×28 pixels

---

# IMAGE PREPROCESSING

Apply exactly the preprocessing used inside the uploaded notebook.

Typical operations include:

- Convert to grayscale
- Resize to 28×28
- Normalize pixel values
- Expand dimensions
- Match input tensor shape exactly

Example:

(1,28,28,1)

Do not modify preprocessing unless required to match the notebook.

---

# AUTOENCODER INFERENCE

Use the trained Autoencoder.

Run:

autoencoder.predict()

Generate:

- Reconstructed image

Display inference time.

---

# ENCODER

If the notebook contains an encoder:

Run:

encoder.predict()

Display:

- Latent vector
- Dimension size
- Feature visualization

---

# DECODER

If the notebook contains a decoder:

Allow users to:

- Modify latent vector values
- Click Decode
- Generate a new reconstructed digit

---

# RESULTS PAGE

Display:

Original Image

↓

Autoencoder

↓

Reconstructed Image

Show them inside animated comparison cards.

Provide a Before/After slider.

Allow zooming.

Allow fullscreen preview.

---

# METRICS

Display:

- Mean Squared Error (MSE)
- Reconstruction Loss
- Compression Ratio
- Latent Dimension Size
- Prediction Time
- Tensor Shape

---

# LATENT SPACE VISUALIZATION

Visualize latent vectors using:

- Interactive Bar Chart
- Heatmap
- Scatter Plot (if applicable)

Include hover tooltips.

---

# DOWNLOAD

Allow downloading reconstructed images in:

- PNG
- JPG

---

# API ENDPOINTS

POST /predict

Returns:

- Original image
- Reconstructed image
- MSE
- Prediction time

POST /encode

Returns:

- Latent vector

POST /decode

Input:

- Latent vector

Returns:

- Generated image

GET /health

Returns:

{
  "status":"running"
}

---

# UI DESIGN

Design style:

- Premium AI Dashboard
- Glassmorphism
- Rounded corners
- Smooth animations
- Modern typography
- Responsive layout
- Beautiful gradients
- Hover animations
- Micro-interactions
- Floating effects
- Blur cards

Use Framer Motion throughout the application.

---

# COLOR PALETTE

Primary:
#2563EB

Secondary:
#7C3AED

Accent:
#06B6D4

Background:
#0F172A

Cards:
rgba(255,255,255,0.08)

---

# EXTRA FEATURES

Include:

- Loading animation
- Skeleton loading
- Toast notifications
- Responsive sidebar
- Theme switcher
- Keyboard shortcuts
- Compare slider
- Fullscreen preview
- Image zoom
- Auto-save UI state
- Error pages
- Empty states
- Success animations

---

# PERFORMANCE

Optimize for production:

- Lazy loading
- Code splitting
- Memoization
- Reusable React components
- Optimized TensorFlow inference
- Fast image preprocessing
- Compressed assets
- Efficient API responses

---

# SECURITY

Implement:

- File validation
- Maximum upload size
- Safe image parsing
- Exception handling
- Secure API validation
- Environment variables
- No hardcoded file paths

---

# DOCUMENTATION

Generate a complete README.md including:

- Project overview
- Features
- Folder structure
- Installation
- Running locally
- Deployment steps
- Netlify configuration
- Flask backend setup
- API documentation
- Troubleshooting
- Screenshots placeholders

---

# DEPLOYMENT

Prepare the project for deployment.

Preferred:

React + TensorFlow.js + Netlify

If TensorFlow.js conversion is not feasible:

Provide:

React Frontend + Flask Backend

Include complete deployment instructions for both.

Ensure the project runs without modification after deployment.

---

# CODE QUALITY

Generate:

- Clean architecture
- Modular components
- Reusable utilities
- Proper comments
- Consistent formatting
- Production-grade folder structure
- Well-organized API
- Error boundaries
- Logging
- Maintainable code

---

# FINAL DELIVERABLES

Generate the complete project including:

- React frontend
- Flask backend
- Tailwind CSS
- Framer Motion
- TensorFlow integration
- Autoencoder inference
- Encoder and Decoder integration
- Image preprocessing
- API endpoints
- Netlify configuration
- Environment configuration
- Requirements.txt
- Package.json
- README.md
- Deployment guide
- Beautiful responsive UI
- Production-ready code

The application must automatically use the uploaded Google Colab notebook, extract the trained Autoencoder model, preserve the exact preprocessing pipeline, and produce outputs that match the notebook as closely as possible. The final project should be polished, visually stunning, modular, scalable, and ready for production deployment.