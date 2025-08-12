import pickle
import hashlib
import os
import zlib 
import comfy
import folder_paths
import json

class AnyType(str):
    def __ne__(self, __value: object) -> bool:
        return False
any_typ = AnyType("*")

def derive_key(password: str, length: int) -> bytes:
    sha = hashlib.sha256(password.encode()).digest()
    return (sha * (length // len(sha) + 1))[:length]

def xor_encrypt(data: bytes, password: str) -> bytes:
    key = derive_key(password, len(data))
    return bytes([b ^ k for b, k in zip(data, key)])

class LoadXORPickleFromFile:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "filename": ("STRING", {"default": "file.pkl"}),
                "password": ("STRING", {"multiline": False}),
            }
        }

    RETURN_TYPES = (any_typ,)
    RETURN_NAMES = ("object",)
    FUNCTION = "load"

    CATEGORY = "XOR Pickle"

    def load(self, filename, password):
        if not os.path.exists(filename):
            raise FileNotFoundError(f"File non trovato: {filename}")

        with open(filename, "rb") as f:
            encrypted_data = f.read()

        decrypted_data = xor_encrypt(encrypted_data, password)
        decompressed_data = zlib.decompress(decrypted_data)
        obj = pickle.loads(decompressed_data)
        return (obj,)

class SaveXORPickleToFile:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "obj": (any_typ,),
                "filename": ("STRING", {"default": "/content/file.pkl"}),
                "password": ("STRING", {"multiline": False}),
            }
        }

    RETURN_TYPES = ()
    FUNCTION = "save"
    OUTPUT_NODE = True

    CATEGORY = "XOR Pickle"

    def save(self, obj, filename, password):
        pickled_data = pickle.dumps(obj)
        compressed_data = zlib.compress(pickled_data)
        encrypted_data = xor_encrypt(compressed_data, password)

        out_path = os.path.join(folder_paths.get_output_directory(), filename)
        with open(out_path, "wb") as f:
            f.write(encrypted_data)

        print(f"[XORPickle] Salvato: {out_path}")
        return {}

class DecryptXORText:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                # Campo di input per il testo criptato (stringa esadecimale)
                "encrypted_text": ("STRING", {"multiline": True}),
                # Campo di input per la password
                "password": ("STRING", {"multiline": False}),
            }
        }

    RETURN_TYPES = (any_typ,)
    RETURN_NAMES = ("decrypted_object",)
    FUNCTION = "decrypt"
    CATEGORY = "XOR Pickle"

    def decrypt(self, encrypted_text, password):
        try:
            # 1. Converte la stringa esadecimale in byte
            encrypted_bytes = bytes.fromhex(encrypted_text)

            # 2. Decifra i byte usando la stessa funzione XOR
            decrypted_bytes = xor_encrypt(encrypted_bytes, password)

            # 3. Decodifica i byte in una stringa JSON
            json_string = decrypted_bytes.decode('utf-8')

            # 4. Parsa la stringa JSON per ottenere l'oggetto Python
            obj = json.loads(json_string)

            return (obj,)
        except Exception as e:
            # In caso di errore (es. password errata), solleva un'eccezione
            raise Exception(f"Errore durante la decifratura: {e}")