import socket
import os
import sys

# Patch getaddrinfo to bypass DNS issues with supabase in India/Router caching
_orig_getaddrinfo = socket.getaddrinfo
def patched_getaddrinfo(*args, **kwargs):
    try:
        host = args[0]
        if isinstance(host, str) and host.endswith('.supabase.co'):
            return _orig_getaddrinfo('104.18.38.10', *args[1:], **kwargs)
    except Exception:
        pass
    return _orig_getaddrinfo(*args, **kwargs)

socket.getaddrinfo = patched_getaddrinfo

# Backup main and rewrite
with open('main_orig.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Only inject if not already injected
if '# Patch getaddrinfo' not in content:
    rewrite = f"""import socket
# Patch getaddrinfo to bypass DNS issues with supabase
_orig_getaddrinfo = socket.getaddrinfo
def patched_getaddrinfo(*args, **kwargs):
    try:
        host = args[0]
        if isinstance(host, str) and host.endswith('.supabase.co'):
            return _orig_getaddrinfo('104.18.38.10', *args[1:], **kwargs)
    except Exception:
        pass
    return _orig_getaddrinfo(*args, **kwargs)
socket.getaddrinfo = patched_getaddrinfo

{content}"""
    with open('main.py', 'w', encoding='utf-8') as f:
        f.write(rewrite)
        print("Patched main.py successfully.")
