import pickle
import hashlib
import os
import comfy
import folder_paths

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
        # Nessun uso di folder_paths, il percorso è preso direttamente dalla stringa
        if not os.path.exists(filename):
            raise FileNotFoundError(f"File non trovato: {filename}")

        with open(filename, "rb") as f:
            encrypted_data = f.read()

        decrypted_data = xor_encrypt(encrypted_data, password)
        obj = pickle.loads(decrypted_data)
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
        encrypted_data = xor_encrypt(pickled_data, password)
        out_path = os.path.join(folder_paths.get_output_directory(), filename)
        with open(out_path, "wb") as f:
            f.write(encrypted_data)
        print(f"[XORPickle] Salvato: {out_path}")
        return {}
