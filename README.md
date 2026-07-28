# Intelligent Web Apps Journey 🚀

Welcome to my journey of exploring artificial intelligence and modern web development through practical projects. This repository contains a collection of intelligent web applications created for learning, experimentation, and implementation of AI/ML concepts.

---

## 👁️‍🗨️ Featured Project: AutoEncoder Lab (Premium Denoising & Reconstruction)

AutoEncoder Lab is a production-ready, interactive Deep Learning web application designed to demonstrate image compression and noise reduction using a convolutional autoencoder model trained on the MNIST handwritten digit dataset. 

Built around the exact model architecture specified in `AutoEncoders_DL.ipynb`, the application is split into a **React 18 frontend** and a **Flask backend API**. It features custom canvas drawing inputs, real-time comparisons, before/after slider layers, metric calculations, and an interactive 2D latent space mapping viewer.

### 🚀 Key Features

*   **Handwriting Canvas:** Draw a digit with brush/eraser sizing and full undo/redo capabilities. Downsamples drawings automatically to 28x28 grayscale tensors.
*   **Drag & Drop Upload:** Browse or drop PNG/JPG/JPEG digit images for instant inference.
*   **Interactive Comparison Slider:** Swipe side-by-side to compare original noisy inputs with denoised neural reconstructions.
*   **Inference Latency & Metrics:** Displays Mean Squared Error (MSE), latency times in milliseconds, compression ratios, and shape configurations.
*   **Latent Space Painter:** Explores the 392-dimensional bottleneck representation (8 channels of 7x7 activation grids). Click or hover-scroll grids to paint activations directly and morph digits in real time.
*   **Download Center:** Export the autoencoder-synthesized images to PNG format.

---

### 📂 Project Structure

```
AutoEncoder-WebApp/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CanvasDraw.jsx      # Handwriting canvas with Undo/Redo & size controls
│   │   │   ├── ImageUpload.jsx      # Drag & Drop upload with validation
│   │   │   ├── Dashboard.jsx        # Comparison workspace with slider & zoom
│   │   │   ├── LatentSpace.jsx      # Interactive heatmaps & decoder editor
│   │   │   ├── Navbar.jsx           # Connection health indicator
│   │   │   └── Toast.jsx            # Dynamic message bubbles
│   │   ├── services/
│   │   │   └── api.js               # Axios API endpoints mappings
│   │   ├── App.jsx                  # Main routing & state controller
│   │   ├── index.css                # Base styling & glassmorphism system
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/
│   ├── model/                       # Folder containing trained models
│   │   ├── autoencoder.h5           # Complete autoencoder model
│   │   ├── encoder.h5               # Encoder layer sub-model
│   │   └── decoder.h5               # Decoder layer sub-model
│   ├── app.py                       # Flask server and routing
│   ├── preprocessing.py             # Normalization, resizing, shape manipulation
│   ├── train_models.py              # Script to train and export model (.h5 format)
│   └── requirements.txt             # Python packages
├── netlify.toml                     # Netlify build configurations
├── .gitignore
├── .env.example
└── README.md
```

---

### 💻 Running Locally

#### 1. Prerequisites
Ensure you have the following installed:
*   Python 3.8 or higher
*   Node.js & NPM (for compiling the React app locally)

#### 2. Backend Setup
1. Open a terminal in the project directory.
2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. (Optional) Re-train and export the Keras models:
   ```bash
   python backend/train_models.py
   ```
   *Note: Trained models are already saved inside `backend/model/` so you can skip training.*
4. Start the Flask server:
   ```bash
   python backend/app.py
   ```
   The backend will run on `http://localhost:5000`.

#### 3. Frontend Setup
1. Open a new terminal in the `frontend` subdirectory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`. Open your browser to the listed local address.

---

### 🌐 Production Deployment

#### Frontend (Netlify)
The project is configured for deployment to Netlify using the `netlify.toml` file in the root. 
1. Push this project to GitHub.
2. Create a new site on Netlify and link your GitHub repository.
3. Netlify will auto-detect the root directory and use the settings defined in `netlify.toml` to compile:
   *   **Build command:** `npm run build --prefix frontend`
   *   **Publish directory:** `frontend/dist`
4. Set the environment variable `VITE_API_URL` to point to your live backend server API.

#### Backend (Python Server)
Deploy the Flask API to any hosting provider (Heroku, Render, AWS, GCP, etc.).
1. Ensure the backend environment has `tensorflow`, `flask`, `flask-cors`, `numpy`, `pillow`, and `opencv-python`.
2. Run the app using a production WSGI server like `gunicorn` (Linux):
   ```bash
   gunicorn app:app --bind 0.0.0.0:5000
   ```

---

### 🔌 API Documentation

#### 1. Healthcheck
*   **URL:** `GET /health`
*   **Response:**
    ```json
    {
      "models_loaded": true,
      "status": "running",
      "tensorflow_version": "2.21.0"
    }
    ```

#### 2. Full Autoencoder Inference
*   **URL:** `POST /predict`
*   **Request Body:** `{"image": "data:image/png;base64,..."}`
*   **Response:**
    ```json
    {
      "original": "data:image/png;base64,...",
      "reconstructed": "data:image/png;base64,...",
      "mse": 0.00238,
      "prediction_time": 0.05,
      "latent_dim": [7, 7, 8],
      "input_shape": [28, 28, 1]
    }
    ```

#### 3. Encoder (Fetch Latent Vector)
*   **URL:** `POST /encode`
*   **Request Body:** `{"image": "data:image/png;base64,..."}`
*   **Response:**
    ```json
    {
      "latent_vector": [0.12, 0.0, 0.45, ...],
      "latent_shape": [7, 7, 8]
    }
    ```

#### 4. Decoder (Reconstruct from Latent Representation)
*   **URL:** `POST /decode`
*   **Request Body:** `{"latent_vector": [...]}`
*   **Response:**
    ```json
    {
      "reconstructed": "data:image/png;base64,..."
    }
    ```

---

### 🛠️ Troubleshooting

*   **API Offline indicator in Navbar:** Ensure your Flask server is running locally on port 5000. If you changed the port, update the address in `frontend/src/services/api.js` or define `VITE_API_URL` in a `.env` file.
*   **Black/inverted reconstructions:** Ensure you draw inside the canvas using the brush tool (which draws with white strokes on a black background). Drawing black lines on a white canvas causes bad inputs.

---

## 🎯 Purpose of Journey

The goal of this repository is to understand AI concepts, improve software development skills, and transform machine learning ideas into interactive web experiences.

