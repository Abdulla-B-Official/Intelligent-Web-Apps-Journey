import axios from "axios";

// Render backend URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://mnist-autoencoder-api.onrender.com";


const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // 2 minutes for TensorFlow inference
});


export const apiService = {

  // Check backend status
  async checkHealth() {
    try {
      const response = await client.get("/health");
      return response.data;

    } catch (error) {
      console.error(
        "Health Check Failed:",
        error.response?.data || error.message
      );

      throw new Error("API Offline");
    }
  },


  // Complete Autoencoder Reconstruction
  async predict(base64Image, noiseLevel = 0) {

    try {

      const response = await client.post("/predict", {
        image: base64Image,
        noise_level: Number(noiseLevel),
      });

      return response.data;


    } catch (error) {

      console.error(
        "Prediction Error:",
        error.response?.data || error.message
      );

      throw (
        error.response?.data?.error ||
        "Failed to reconstruct image"
      );
    }
  },



  // Encoder API
  async encode(base64Image, noiseLevel = 0) {

    try {

      const response = await client.post("/encode", {

        image: base64Image,

        noise_level: Number(noiseLevel),

      });


      return response.data;


    } catch (error) {

      console.error(
        "Encoding Error:",
        error.response?.data || error.message
      );


      throw (
        error.response?.data?.error ||
        "Failed to encode image"
      );
    }
  },



  // Decoder API
  async decode(latentVector) {

    try {

      const response = await client.post("/decode", {

        latent_vector: latentVector,

      });


      return response.data;


    } catch(error) {

      console.error(
        "Decoding Error:",
        error.response?.data || error.message
      );


      throw (
        error.response?.data?.error ||
        "Failed to decode latent vector"
      );
    }
  },


};


export default apiService;
