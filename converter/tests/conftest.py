import sys
import os

# Ensure the src directory is in the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/converter')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../tests/resources')))
