import sys
import numpy as np
import pandas as pd
import tensorflow as tf
import sklearn
import keras  # standalone keras (주의: tensorflow.keras와 별개일 수 있음)

print("=== Version Information ===")
print("Python version:         ", sys.version)
print("NumPy version:          ", np.__version__)
print("Pandas version:         ", pd.__version__)
print("TensorFlow version:     ", tf.__version__)
print("Standalone Keras version:", keras.__version__)
print("scikit-learn version:   ", sklearn.__version__)
