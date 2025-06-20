from .xor_pickle_nodes import LoadXORPickleFromFile, SaveXORPickleToFile

NODE_CLASS_MAPPINGS = {
    "Load XOR Pickle From File": LoadXORPickleFromFile,
    "Save XOR Pickle To File": SaveXORPickleToFile,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "Load XOR Pickle From File": "Decrypt XOR Pickle from File",
    "Save XOR Pickle To File": "Encrypt & Save XOR Pickle to File",
}
