import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from keras import Sequential, Model, Input
from keras.layers import Conv2D, MaxPool2D, UpSampling2D

def train_and_save():
    print("TensorFlow Version:", tf.__version__)
    
    # 1. Load MNIST Data
    print("Loading MNIST dataset...")
    (X_train, _), (X_test, _) = keras.datasets.mnist.load_data()
    
    # 2. Preprocess Data
    print("Preprocessing data...")
    X_train = X_train.reshape(60000, 28, 28, 1).astype('float32') / 255.0
    X_test = X_test.reshape(10000, 28, 28, 1).astype('float32') / 255.0
    
    # Add noise exactly as in the notebook
    np.random.seed(42)  # For reproducibility of local verification
    X_train_noise = X_train + 0.25 * np.random.normal(loc=0.0, scale=1.0, size=X_train.shape)
    X_test_noise = X_test + 0.25 * np.random.normal(loc=0.0, scale=1.0, size=X_test.shape)
    
    X_train_clipped = np.clip(X_train_noise, 0.0, 1.0)
    X_test_clipped = np.clip(X_test_noise, 0.0, 1.0)
    
    # 3. Define the Sequential Autoencoder Model
    print("Defining autoencoder model...")
    model = Sequential([
        # Encoder
        Conv2D(filters=32, kernel_size=(3, 3), strides=(1, 1), padding='same', activation="relu", input_shape=(28, 28, 1)),
        MaxPool2D(pool_size=(2, 2)),
        Conv2D(filters=8, kernel_size=(3, 3), strides=(1, 1), padding='same', activation="relu"),
        MaxPool2D(pool_size=(2, 2)),
        
        # Decoder
        Conv2D(filters=8, kernel_size=(3, 3), strides=(1, 1), padding='same', activation="relu"),
        UpSampling2D(size=(2, 2)),
        Conv2D(filters=32, kernel_size=(3, 3), strides=(1, 1), padding='same', activation="relu"),
        UpSampling2D(size=(2, 2)),
        Conv2D(filters=1, kernel_size=(3, 3), strides=(1, 1), padding='same', activation="relu")
    ])
    
    model.summary()
    
    # 4. Compile and Train
    model.compile(optimizer='adam', loss="mean_squared_error", metrics=["accuracy"])
    
    print("Training model for 5 epochs...")
    # Follow validation data structure from the notebook: validation_data=(X_test, X_test_clipped)
    # Note: validation_data in notebook is input=X_test, target=X_test_clipped
    model.fit(
        x=X_train_clipped, 
        y=X_train, 
        batch_size=32, 
        epochs=5, 
        validation_data=(X_test, X_test_clipped)
    )
    
    # Evaluate model
    loss, acc = model.evaluate(X_test_clipped, X_test)
    print(f"Test Loss: {loss:.4f}, Test Accuracy: {acc:.4f}")
    
    # 5. Extract Encoder and Decoder
    print("Extracting Encoder and Decoder models...")
    # Encoder
    encoder_input = Input(shape=(28, 28, 1), name="encoder_input")
    x = encoder_input
    for layer in model.layers[:4]:
        x = layer(x)
    encoder = Model(inputs=encoder_input, outputs=x, name="encoder")
    
    # Decoder
    decoder_input = Input(shape=(7, 7, 8), name="decoder_input")
    y = decoder_input
    for layer in model.layers[4:]:
        y = layer(y)
    decoder = Model(inputs=decoder_input, outputs=y, name="decoder")
    
    # Verify equivalence
    print("Verifying model equivalence...")
    sample = X_test_clipped[:5]
    pred_auto = model.predict(sample)
    latent = encoder.predict(sample)
    pred_dec = decoder.predict(latent)
    
    diff = np.max(np.abs(pred_auto - pred_dec))
    print(f"Max absolute difference between Autoencoder and Encoder+Decoder prediction: {diff:.6e}")
    if diff < 1e-5:
        print("Equivalence verification passed!")
    else:
        print("WARNING: Equivalence verification failed. Please double check layer connection.")
        
    # 6. Save models
    os.makedirs("backend/model", exist_ok=True)
    
    print("Saving autoencoder.h5...")
    model.save("backend/model/autoencoder.h5")
    
    print("Saving encoder.h5...")
    encoder.save("backend/model/encoder.h5")
    
    print("Saving decoder.h5...")
    decoder.save("backend/model/decoder.h5")
    
    print("All models trained and saved successfully in backend/model/!")

if __name__ == "__main__":
    train_and_save()
