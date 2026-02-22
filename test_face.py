import face_recognition
import numpy as np
import cv2
print("Face Recognition and OpenCV imported successfully")

# Create a blank image and try to find faces (should be 0)
img = np.zeros((100, 100, 3), dtype=np.uint8)
encodings = face_recognition.face_encodings(img)
print(f"Face encodings found: {len(encodings)}")
