"""
Database Configuration
Switch between JSON files (development) and Supabase PostgreSQL (production)
"""
import os
from typing import Any

# Database mode: 'json' or 'supabase'
DATABASE_MODE = os.getenv('DATABASE_MODE', 'json')  # Default to JSON for development


def get_database() -> Any:
    """
    Get the appropriate database instance based on configuration.
    
    Usage in main.py:
        from backend.db_config import get_database
        db = get_database()
    """
    if DATABASE_MODE == 'supabase':
        try:
            from backend.secure_supabase_db import SecureSupabaseDatabase
            print("� Using SECURE Supabase Database (Encrypted + Zero-Knowledge)")
            return SecureSupabaseDatabase()
        except ImportError:
            print("⚠️  Supabase or cryptography not installed. Run: pip install supabase cryptography")
            print("📁 Falling back to JSON file database")
            from backend.database import Database
            return Database()
        except ValueError as e:
            print(f"⚠️  Supabase configuration error: {e}")
            print("📁 Falling back to JSON file database")
            from backend.database import Database
            return Database()
        except Exception as e:
            print(f"⚠️  Supabase initialization failed: {e}")
            print("📁 Falling back to JSON file database")
            from backend.database import Database
            return Database()
    else:
        from backend.database import Database
        print("📁 Using JSON File Database (Development Mode)")
        return Database()


# Configuration helpers
def is_production() -> bool:
    """Check if running in production mode."""
    return os.getenv('ENVIRONMENT', 'development') == 'production'


def get_database_url() -> str:
    """Get database connection URL."""
    if DATABASE_MODE == 'supabase':
        return os.getenv('SUPABASE_URL', '')
    return 'json://local/data'


# Database configuration settings
DB_CONFIG = {
    'mode': DATABASE_MODE,
    'is_production': is_production(),
    'connection_url': get_database_url(),
    'max_connections': int(os.getenv('DB_MAX_CONNECTIONS', '10')),
    'timeout': int(os.getenv('DB_TIMEOUT', '30')),
    'enable_logging': os.getenv('DB_LOGGING', 'false').lower() == 'true'
}


def print_db_info():
    """Print current database configuration."""
    print("\n" + "="*50)
    print("🗄️  DATABASE CONFIGURATION")
    print("="*50)
    print(f"Mode: {DB_CONFIG['mode'].upper()}")
    print(f"Environment: {'Production' if DB_CONFIG['is_production'] else 'Development'}")
    print(f"Connection: {DB_CONFIG['connection_url']}")
    print("="*50 + "\n")


if __name__ == "__main__":
    print_db_info()
    
    # Test database connection
    try:
        db = get_database()
        print("✅ Database initialized successfully!")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
