import face_recognition
import numpy as np
import cv2
import io
from PIL import Image

def get_face_encoding(image_bytes):
    try:
        # Convert bytes to PIL Image and then to RGB
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert('RGB')
        image_np = np.array(image)
        
        # Find face encodings
        encodings = face_recognition.face_encodings(image_np)
        if len(encodings) > 0:
            return encodings[0]
    except Exception as e:
        print(f"Face encoding error: {e}")
    return None

def compare_faces(known_encodings, unknown_encoding_bytes):
    # unknown_encoding_bytes is the bytes from the camera/upload
    unknown_encoding = get_face_encoding(unknown_encoding_bytes)
    if unknown_encoding is None:
        return None, "No face detected"
    
    # Compare with known encodings
    # known_encodings is a list of (id, encoding_np)
    if not known_encodings:
        return None, "No registered employees"
        
    known_ids = [item[0] for item in known_encodings]
    known_encs = [item[1] for item in known_encodings]
    
    # Strict tolerance (0.4) to prevent false positives
    # Lower value = stricter matching = fewer false matches
    MATCH_TOLERANCE = 0.4
    
    matches = face_recognition.compare_faces(known_encs, unknown_encoding, tolerance=MATCH_TOLERANCE)
    face_distances = face_recognition.face_distance(known_encs, unknown_encoding)
    
    if True in matches:
        best_match_index = np.argmin(face_distances)
        best_distance = face_distances[best_match_index]
        
        # Double-check: only accept if the best distance is below our strict threshold
        if matches[best_match_index] and best_distance < MATCH_TOLERANCE:
            confidence = round((1 - best_distance) * 100, 1)
            print(f"Face matched: ID={known_ids[best_match_index]}, distance={best_distance:.4f}, confidence={confidence}%")
            return known_ids[best_match_index], "Match found"
        else:
            print(f"Face rejected: best_distance={best_distance:.4f} >= threshold={MATCH_TOLERANCE}")
    
    return None, "Face not recognized"
