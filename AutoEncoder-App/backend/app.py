import os
import time
import gc
import numpy as np
import tensorflow as tf
from tensorflow import keras
from flask import Flask, request, jsonify
from flask_cors import CORS

from preprocessing import preprocess_image, postprocess_image


# Reduce TensorFlow unnecessary logs
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"


# Initialize Flask app
app = Flask(__name__)

# Enable CORS for frontend
CORS(app)


# Global model variables
autoencoder = None
encoder = None
decoder = None


def load_models():
    global autoencoder, encoder, decoder

    model_dir = os.path.join(os.path.dirname(__file__), "model")

    autoencoder_path = os.path.join(model_dir, "autoencoder.h5")
    encoder_path = os.path.join(model_dir, "encoder.h5")
    decoder_path = os.path.join(model_dir, "decoder.h5")

    print("Loading models from:", model_dir)

    try:
        # Load only autoencoder for prediction
        autoencoder = keras.models.load_model(
            autoencoder_path,
            compile=False
        )

        print("Autoencoder loaded successfully!")

        # Load encoder and decoder only if files exist
        if os.path.exists(encoder_path):
            encoder = keras.models.load_model(
                encoder_path,
                compile=False
            )
            print("Encoder loaded successfully!")

        if os.path.exists(decoder_path):
            decoder = keras.models.load_model(
                decoder_path,
                compile=False
            )
            print("Decoder loaded successfully!")

        print("All available models loaded!")

    except Exception as e:
        print("Model loading error:", str(e))


# Load models when server starts
load_models()


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "MNIST Autoencoder API is running",
        "status": "online"
    })


@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "running",
        "tensorflow_version": tf.__version__,
        "models_loaded": autoencoder is not None
    })


@app.route("/predict", methods=["POST"])
def predict():

    if autoencoder is None:
        return jsonify({
            "error": "Autoencoder model is not loaded"
        }), 503

    try:

        data = request.get_json()

        if not data or "image" not in data:
            return jsonify({
                "error": "No image field found"
            }), 400


        base64_image = data["image"]


        # Preprocess image
        preprocessed = preprocess_image(base64_image)


        # Add noise if required
        noise_level = float(
            data.get("noise_level", 0.0)
        )

        if noise_level > 0:

            noise = noise_level * np.random.normal(
                loc=0.0,
                scale=1.0,
                size=preprocessed.shape
            )

            noisy_preprocessed = np.clip(
                preprocessed + noise,
                0.0,
                1.0
            )

        else:

            noisy_preprocessed = preprocessed



        # Prediction
        start_time = time.time()

        reconstructed = autoencoder.predict(
            noisy_preprocessed,
            verbose=0
        )

        prediction_time = time.time() - start_time


        # Calculate error
        mse = float(
            np.mean(
                (preprocessed - reconstructed) ** 2
            )
        )


        # Convert images
        original_url = postprocess_image(
            preprocessed
        )

        noisy_url = postprocess_image(
            noisy_preprocessed
        )

        reconstructed_url = postprocess_image(
            reconstructed
        )


        # Free memory
        gc.collect()


        return jsonify({

            "original": original_url,
            "noisy": noisy_url,
            "reconstructed": reconstructed_url,

            "mse": mse,

            "prediction_time": prediction_time,

            "latent_dim": [
                7,
                7,
                8
            ],

            "input_shape": [
                28,
                28,
                1
            ]

        })


    except Exception as e:

        return jsonify({
            "error": f"Inference failed: {str(e)}"
        }), 500



@app.route("/encode", methods=["POST"])
def encode():

    if encoder is None:

        return jsonify({
            "error": "Encoder model not loaded"
        }), 503


    try:

        data = request.get_json()

        base64_image = data["image"]

        preprocessed = preprocess_image(
            base64_image
        )


        latent = encoder.predict(
            preprocessed,
            verbose=0
        )


        return jsonify({

            "latent_vector": latent.flatten().tolist(),

            "latent_shape": list(
                latent.shape[1:]
            )

        })


    except Exception as e:

        return jsonify({
            "error": str(e)
        }),500



@app.route("/decode", methods=["POST"])
def decode():

    if decoder is None:

        return jsonify({
            "error": "Decoder model not loaded"
        }),503


    try:

        data = request.get_json()

        latent_vector = data["latent_vector"]


        latent_array = np.array(
            latent_vector,
            dtype=np.float32
        ).reshape(
            1,
            7,
            7,
            8
        )


        decoded = decoder.predict(
            latent_array,
            verbose=0
        )


        return jsonify({

            "reconstructed":
            postprocess_image(decoded)

        })


    except Exception as e:

        return jsonify({
            "error": str(e)
        }),500



if __name__ == "__main__":

    port = int(
        os.environ.get(
            "PORT",
            5000
        )
    )

    app.run(
        host="0.0.0.0",
        port=port
    )
