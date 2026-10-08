import hashlib
from typing import BinaryIO

class HashService:
    """
    Computes SHA-256 cryptographic digests in a streaming fashion.
    Prevents loading large binaries into memory at once.
    """
    CHUNK_SIZE = 64 * 1024  # 64KB chunks

    @classmethod
    def calculate_sha256(cls, file_stream: BinaryIO) -> str:
        sha256 = hashlib.sha256()
        file_stream.seek(0)
        while True:
            chunk = file_stream.read(cls.CHUNK_SIZE)
            if not chunk:
                break
            sha256.update(chunk)
        return sha256.hexdigest().lower()

    @classmethod
    def calculate_bytes_sha256(cls, data: bytes) -> str:
        return hashlib.sha256(data).hexdigest().lower()

    @classmethod
    def compare_hashes(cls, hash_a: str, hash_b: str) -> bool:
        clean_a = hash_a.strip().lower().replace("0x", "")
        clean_b = hash_b.strip().lower().replace("0x", "")
        return clean_a == clean_b
