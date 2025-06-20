# 🔐 ComfyUI XOR Pickle Nodes

Two custom nodes for [ComfyUI](https://github.com/comfyanonymous/ComfyUI) that allow you to **encrypt and decrypt Python objects** using simple XOR encryption with `pickle`.

## ✨ Features

- 🔐 Encrypt any Python object (`ANY`) using a password  
- 📂 Load from or save to `.pkl` files using a file path (`STRING`)  
- ⚙️ Pure Python – no external dependencies  
- 🧩 Great for caching, presets, or saving intermediate states

> ⚠️ **Note:** XOR is not secure for sensitive data. It’s intended for simple obfuscation only.

## 📦 Included Nodes

### 🔓 `Load XOR Pickle From File`
- **Inputs:**  
  - `filename` *(STRING)* – path to the encrypted `.pkl` file  
  - `password` *(STRING)* – decryption key  
- **Output:**  
  - Decrypted object *(ANY)*

### 🔐 `Save XOR Pickle To File`
- **Inputs:**  
  - `obj` *(ANY)* – object to encrypt and save  
  - `filename` *(STRING)* – output file path  
  - `password` *(STRING)* – encryption key  
- **Output:**  
  - *(none – saves to disk)*

## 📁 Installation

1. Copy the files into your ComfyUI `custom_nodes/` folder:
