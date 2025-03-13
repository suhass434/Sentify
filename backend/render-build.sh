#!/bin/bash
# Install Python 3.13.2 (if supported)
pyenv install 3.10.12 --skip-existing
pyenv global 3.10.12

# Install dependencies
pip install -r requirements.txt
npm install