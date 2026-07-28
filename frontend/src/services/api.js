import axios from 'axios';

// Dynamically use environment variable or fallback to local Flask port
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  /**
   * Run full autoencoder inference
   * @param {string} base64Image - PNG/JPG image in Base64 Data URL format
   * @param {number} noiseLevel - Noise level between 0.0 and 1.0
   */
  async predict(base64Image, noiseLevel = 0.0) {
    try {
      const response = await client.post('/predict', { image: base64Image, noise_level: noiseLevel });
      return response.data;
    } catch (error) {
      console.error('API Error (predict):', error);
      throw error.response?.data?.error || 'Failed to process autoencoder inference.';
    }
  },

  /**
   * Run encoder to obtain latent vector
   * @param {string} base64Image - PNG/JPG image in Base64 Data URL format
   * @param {number} noiseLevel - Noise level between 0.0 and 1.0
   */
  async encode(base64Image, noiseLevel = 0.0) {
    try {
      const response = await client.post('/encode', { image: base64Image, noise_level: noiseLevel });
      return response.data;
    } catch (error) {
      console.error('API Error (encode):', error);
      throw error.response?.data?.error || 'Failed to encode image.';
    }
  },

  /**
   * Run decoder to synthesize reconstructed image from latent representation
   * @param {Array<number>} latentVector - Flattened array of 392 floats
   */
  async decode(latentVector) {
    try {
      const response = await client.post('/decode', { latent_vector: latentVector });
      return response.data;
    } catch (error) {
      console.error('API Error (decode):', error);
      throw error.response?.data?.error || 'Failed to synthesize latent vector.';
    }
  },

  /**
   * Query API Health Status
   */
  async checkHealth() {
    try {
      const response = await client.get('/health', { timeout: 3000 });
      return response.data;
    } catch (error) {
      console.error('API Error (health):', error);
      throw new Error('API Offline');
    }
  },
};
export default apiService;
