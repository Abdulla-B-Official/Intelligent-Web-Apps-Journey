import base64
import io
import numpy as np
from PIL import Image

def decode_base64_image(base64_str):
    """
    Decodes a base64 string to a PIL Image.
    Supports formats with or without the header data:image/png;base64,
    """
    if "," in base64_str:
        base64_str = base64_str.split(",")[1]
    
    img_data = base64.b64decode(base64_str)
    return Image.open(io.BytesIO(img_data))

def preprocess_image(image_input):
    """
    Applies the exact notebook preprocessing:
    1. Converts image to Grayscale (L mode)
    2. Resizes image to 28x28 pixels
    3. Normalizes pixel values by dividing by 255.0
    4. Reshapes/expands dimensions to (1, 28, 28, 1)
    
    Accepts PIL Image, bytes, or base64 string.
    """
    if isinstance(image_input, str):
        img = decode_base64_image(image_input)
    elif isinstance(image_input, bytes):
        img = Image.open(io.BytesIO(image_input))
    elif isinstance(image_input, Image.Image):
        img = image_input
    else:
        raise ValueError("Invalid image input type. Must be base64 string, bytes, or PIL Image.")
    
    # 1. Convert to grayscale
    img_gray = img.convert('L')
    
    # 2. Resize to 28x28
    img_resized = img_gray.resize((28, 28), Image.Resampling.LANCZOS)
    
    # 3. Convert to numpy array and normalize to [0.0, 1.0]
    img_array = np.array(img_resized, dtype=np.float32) / 255.0
    
    # 4. Expand dimensions to (1, 28, 28, 1)
    img_array = np.expand_dims(img_array, axis=(0, -1))
    
    return img_array

def postprocess_image(numpy_array):
    """
    Converts model output shape (1, 28, 28, 1) back into a base64 PNG data URL.
    """
    # Remove batch and channel dims, clip to [0, 1] range, convert to uint8 [0, 255]
    img_array = np.squeeze(numpy_array)
    img_array = np.clip(img_array, 0.0, 1.0)
    img_array = (img_array * 255.0).astype(np.uint8)
    
    # Create PIL Image
    img = Image.fromarray(img_array, mode='L')
    
    # Save image to bytes IO in PNG format
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    
    # Encode to base64
    img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"
