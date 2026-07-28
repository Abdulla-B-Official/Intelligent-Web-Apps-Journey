import os
import time
import numpy as np
import tensorflow as tf
from tensorflow import keras
from flask import Flask, request, jsonify
from flask_cors import CORS

from preprocessing import preprocess_image, postprocess_image

# Initialize Flask app
app = Flask(__name__)
# Enable CORS for all routes (important for React frontend integration)
CORS(app)

# Disable unnecessary TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Global model variables
autoencoder = None
encoder = None
decoder = None

def load_models():
    global autoencoder, encoder, decoder
    model_dir = os.path.join(os.path.dirname(__file__), 'model')
    
    autoencoder_path = os.path.join(model_dir, 'autoencoder.h5')
    encoder_path = os.path.join(model_dir, 'encoder.h5')
    decoder_path = os.path.join(model_dir, 'decoder.h5')
    
    print("Loading models from:", model_dir)
    try:
        autoencoder = keras.models.load_model(autoencoder_path)
        encoder = keras.models.load_model(encoder_path)
        decoder = keras.models.load_model(decoder_path)
        print("All models loaded successfully!")
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        print("Please run train_models.py to train and export the models first.")

# Load models on startup
load_models()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "running",
        "tensorflow_version": tf.__version__,
        "models_loaded": (autoencoder is not None and encoder is not None and decoder is not None)
    })

@app.route('/predict', methods=['POST'])
def predict():
    if autoencoder is None:
        return jsonify({"error": "Autoencoder model is not loaded"}), 503
        
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "No image field found in request body"}), 400
            
        base64_image = data['image']
        
        # 1. Preprocess the image
        preprocessed = preprocess_image(base64_image)
        
        # 2. Apply noise if requested
        noise_level = float(data.get('noise_level', 0.0))
        if noise_level > 0.0:
            noise = noise_level * np.random.normal(loc=0.0, scale=1.0, size=preprocessed.shape)
            noisy_preprocessed = np.clip(preprocessed + noise, 0.0, 1.0)
        else:
            noisy_preprocessed = preprocessed
        
        # 3. Run inference
        start_time = time.time()
        reconstructed = autoencoder.predict(noisy_preprocessed)
        prediction_time = time.time() - start_time
        
        # 4. Calculate metrics (MSE between clean input and reconstructed output)
        mse = float(np.mean((preprocessed - reconstructed) ** 2))
        
        # 5. Postprocess inputs/outputs to return to front-end
        original_url = postprocess_image(preprocessed)
        noisy_url = postprocess_image(noisy_preprocessed)
        reconstructed_url = postprocess_image(reconstructed)
        
        return jsonify({
            "original": original_url,
            "noisy": noisy_url,
            "reconstructed": reconstructed_url,
            "mse": mse,
            "prediction_time": prediction_time,
            "latent_dim": [7, 7, 8],
            "input_shape": [28, 28, 1]
        })
        
    except Exception as e:
        return jsonify({"error": f"Inference failed: {str(e)}"}), 500

@app.route('/encode', methods=['POST'])
def encode():
    if encoder is None:
        return jsonify({"error": "Encoder model is not loaded"}), 503
        
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "No image field found in request body"}), 400
            
        base64_image = data['image']
        preprocessed = preprocess_image(base64_image)
        
        # Apply noise if requested
        noise_level = float(data.get('noise_level', 0.0))
        if noise_level > 0.0:
            noise = noise_level * np.random.normal(loc=0.0, scale=1.0, size=preprocessed.shape)
            noisy_preprocessed = np.clip(preprocessed + noise, 0.0, 1.0)
        else:
            noisy_preprocessed = preprocessed
        
        # Run encoder
        latent = encoder.predict(noisy_preprocessed)
        # Flatten latent vector for the API response
        latent_flat = latent.flatten().tolist()
        
        return jsonify({
            "latent_vector": latent_flat,
            "latent_shape": list(latent.shape[1:])
        })
        
    except Exception as e:
        return jsonify({"error": f"Encoding failed: {str(e)}"}), 500

@app.route('/decode', methods=['POST'])
def decode():
    if decoder is None:
        return jsonify({"error": "Decoder model is not loaded"}), 503
        
    try:
        data = request.get_json()
        if not data or 'latent_vector' not in data:
            return jsonify({"error": "No latent_vector field found in request body"}), 400
            
        latent_vector = data['latent_vector']
        
        # Reshape to expected shape (1, 7, 7, 8)
        latent_array = np.array(latent_vector, dtype=np.float32).reshape(1, 7, 7, 8)
        
        # Run decoder
        decoded = decoder.predict(latent_array)
        reconstructed_url = postprocess_image(decoded)
        
        return jsonify({
            "reconstructed": reconstructed_url
        })
        
    except Exception as e:
        return jsonify({"error": f"Decoding failed: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
