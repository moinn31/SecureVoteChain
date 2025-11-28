"""
Admin Password Hash Generator
Generates SHA-256 hashes for admin passwords.
"""

import hashlib

def generate_password_hash(password: str) -> str:
    """Generate SHA-256 hash for a password."""
    return hashlib.sha256(password.encode()).hexdigest()

def main():
    print("=" * 60)
    print("Admin Password Hash Generator")
    print("=" * 60)
    print()
    
    while True:
        print("\nOptions:")
        print("1. Generate hash for a single password")
        print("2. Generate SQL INSERT statement for new admin")
        print("3. Verify password against hash")
        print("4. Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == "1":
            password = input("\nEnter password: ")
            hash_value = generate_password_hash(password)
            print(f"\nPassword: {password}")
            print(f"SHA-256 Hash: {hash_value}")
            
        elif choice == "2":
            print("\n--- Create New Admin ---")
            username = input("Username: ").strip()
            password = input("Password: ")
            email = input("Email: ").strip()
            state = input("State (e.g., Maharashtra, Delhi, All States): ").strip()
            
            print("\nRole options:")
            print("  1. super_admin (access all states)")
            print("  2. state_admin (access specific state)")
            role_choice = input("Choose role (1 or 2): ").strip()
            role = "super_admin" if role_choice == "1" else "state_admin"
            
            hash_value = generate_password_hash(password)
            
            sql = f"""
-- Add new admin: {username}
INSERT INTO admins (username, password_hash, email, state, role) VALUES
('{username}', '{hash_value}', '{email}', '{state}', '{role}');
"""
            print("\n" + "=" * 60)
            print("SQL INSERT Statement:")
            print("=" * 60)
            print(sql)
            print("Copy and paste this SQL into Supabase SQL Editor")
            
        elif choice == "3":
            password = input("\nEnter password to verify: ")
            stored_hash = input("Enter stored hash: ").strip()
            
            generated_hash = generate_password_hash(password)
            
            print(f"\nGenerated hash: {generated_hash}")
            print(f"Stored hash:    {stored_hash}")
            
            if generated_hash == stored_hash:
                print("\n✅ MATCH - Password is correct!")
            else:
                print("\n❌ NO MATCH - Password is incorrect!")
                
        elif choice == "4":
            print("\nGoodbye!")
            break
        else:
            print("\n❌ Invalid choice. Please enter 1-4.")

if __name__ == "__main__":
    # Show default admin hashes for reference
    print("\nDefault Admin Credentials (for reference):")
    print("-" * 60)
    default_admins = [
        ("admin", "admin123"),
        ("admin_maharashtra", "mh123"),
        ("admin_delhi", "dl123"),
        ("admin_karnataka", "ka123"),
        ("admin_tamilnadu", "tn123")
    ]
    
    for username, password in default_admins:
        hash_value = generate_password_hash(password)
        print(f"{username:20s} | {password:15s} | {hash_value}")
    
    print("-" * 60)
    print()
    
    main()
