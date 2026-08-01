import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import time
import numpy as np
import tensorflow as tf
from tensorflow import keras

from flask import Flask, request, jsonify
from flask_cors import CORS

from preprocessing import preprocess_image, postprocess_image


app = Flask(__name__)

CORS(app)


# Global model
autoencoder = None


def load_models():

    global autoencoder

    model_dir = os.path.join(
        os.path.dirname(__file__),
        "model"
    )

    autoencoder_path = os.path.join(
        model_dir,
        "autoencoder.h5"
    )

    print("Loading model from:", model_dir)

    try:

        autoencoder = keras.models.load_model(
            autoencoder_path,
            compile=False
        )

        print("Autoencoder loaded successfully!")

    except Exception as e:

        print("Model loading error:")
        print(e)



# Load model when server starts
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

            "error": "Model not loaded"

        }), 503


    try:

        data = request.get_json()


        if not data or "image" not in data:

            return jsonify({

                "error": "No image provided"

            }), 400



        base64_image = data["image"]


        # preprocess image
        image = preprocess_image(base64_image)



        # Noise
        noise_level = float(
            data.get(
                "noise_level",
                0.0
            )
        )


        if noise_level > 0:

            noise = (
                noise_level *
                np.random.normal(
                    0,
                    1,
                    image.shape
                )
            )

            noisy_image = np.clip(
                image + noise,
                0,
                1
            )

        else:

            noisy_image = image



        # Prediction
        start = time.time()


        reconstructed = autoencoder(
            noisy_image,
            training=False
        ).numpy()


        prediction_time = time.time() - start



        # MSE
        mse = float(
            np.mean(
                (image - reconstructed) ** 2
            )
        )


        # Convert back to images
        original_url = postprocess_image(image)

        noisy_url = postprocess_image(
            noisy_image
        )

        reconstructed_url = postprocess_image(
            reconstructed
        )


        return jsonify({

            "original": original_url,

            "noisy": noisy_url,

            "reconstructed": reconstructed_url,

            "mse": mse,

            "prediction_time": prediction_time,

            "input_shape": [
                28,
                28,
                1
            ],

            "latent_dim": [
                7,
                7,
                8
            ]

        })



    except Exception as e:


        print("Prediction error:")
        print(e)


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
