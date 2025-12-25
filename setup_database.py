#!/usr/bin/env python3
"""
Complete Database Setup and Verification Pipeline
Runs the entire process: Excel creation → Database seeding → Verification
"""

import os
import sys
import subprocess
import time
from pathlib import Path

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
CYAN = '\033[96m'
MAGENTA = '\033[95m'
BOLD = '\033[1m'
RESET = '\033[0m'

def print_header():
    """Print the main header"""
    print("\n" + "=" * 80)
    print("🏗️  COMPLETE ASSET MANAGEMENT DATABASE SETUP PIPELINE")
    print("=" * 80)
    print("This pipeline will:")
    print("  1. 📊 Create Excel seed data file")
    print("  2. 🗄️  Seed database with sample data")
    print("  3. ✅ Verify database integrity")
    print("=" * 80 + "\n")

def print_step(step_num: int, description: str):
    """Print a step header"""
    print(f"{CYAN}🚀 STEP {step_num}: {description}{RESET}")

def print_success(msg: str):
    """Print success message"""
    print(f"{GREEN}✅ {msg}{RESET}")

def print_error(msg: str):
    """Print error message"""
    print(f"{RED}❌ {msg}{RESET}")

def print_warning(msg: str):
    """Print warning message"""
    print(f"{YELLOW}⚠️  {msg}{RESET}")

def print_info(msg: str):
    """Print info message"""
    print(f"{BLUE}ℹ️  {msg}{RESET}")

def run_command(command: str, description: str, cwd: str = None) -> bool:
    """Run a command and return success status"""
    try:
        print_info(f"Running: {command}")

        # Set environment for subprocess
        env = os.environ.copy()
        env['PYTHONPATH'] = str(Path(__file__).parent)

        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd or str(Path(__file__).parent),
            env=env,
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            print_success(f"{description} completed successfully")
            return True
        else:
            print_error(f"{description} failed")
            print(f"STDOUT: {result.stdout}")
            print(f"STDERR: {result.stderr}")
            return False

    except Exception as e:
        print_error(f"Error running {description}: {e}")
        return False

def check_prerequisites():
    """Check if all required files exist"""
    print_step(0, "Checking Prerequisites")

    required_files = [
        'db/seeds/python/smart_seed_excel.py',
        'db/seeds/python/seed_to_db.py',
        'db/scripts/verify_database.py'
    ]

    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)

    if missing_files:
        print_error("Missing required files:")
        for file in missing_files:
            print(f"  - {file}")
        return False

    print_success("All required files found")
    return True

def step1_create_excel():
    """Step 1: Create Excel seed data file"""
    print_step(1, "Creating Excel Seed Data File")

    command = "python3 db/seeds/python/smart_seed_excel.py"
    return run_command(command, "Excel file creation")

def step2_seed_database():
    """Step 2: Seed database with data"""
    print_step(2, "Seeding Database")

    command = "python3 db/seeds/python/seed_to_db.py"
    return run_command(command, "Database seeding")

def step3_verify_database():
    """Step 3: Verify database integrity"""
    print_step(3, "Verifying Database Integrity")

    command = "python3 db/scripts/verify_database.py"
    return run_command(command, "Database verification")

def cleanup_temp_files():
    """Clean up any temporary files if needed"""
    print_info("Cleaning up temporary files...")
    # Add cleanup logic here if needed
    pass

def ask_step_confirmation(step_name: str, description: str) -> bool:
    """Ask user for confirmation before running a step"""
    print(f"\n{CYAN}🔄 Ready to run: {step_name}{RESET}")
    print(f"   {description}")
    
    try:
        response = input("Continue? (y/N): ").strip().lower()
        return response in ['y', 'yes']
    except KeyboardInterrupt:
        print(f"\n{BLUE}ℹ️  Step skipped by user{RESET}")
        return False

def main():
    """Main pipeline function"""
    print_header()

    # Check prerequisites
    if not check_prerequisites():
        print_error("Prerequisites check failed. Exiting.")
        sys.exit(1)

    print_warning("⚠️  This pipeline will reset your database and seed it with sample data!")
    print_info("Each step will ask for confirmation before proceeding.")
    print()

    # Track start time
    start_time = time.time()

    # Execute pipeline steps with individual confirmations
    steps = [
        ("Create Excel Data", "Create Excel seed data file with sample data", step1_create_excel),
        ("Seed Database", "Seed database with users, tenants, properties, units, leases, and payments", step2_seed_database),
        ("Verify Database", "Verify database integrity, schemas, and relationships", step3_verify_database)
    ]

    success_count = 0
    for step_name, description, step_func in steps:
        # Ask for confirmation before each step
        if not ask_step_confirmation(step_name, description):
            print_info(f"Skipping {step_name} step")
            continue
            
        # Run the step
        if step_func():
            success_count += 1
        else:
            print_error(f"Pipeline failed at step: {step_name}")
            break

    # Calculate duration
    duration = time.time() - start_time

    # Final summary
    print("\n" + "=" * 80)
    if success_count == len(steps):
        print_success("🎉 COMPLETE PIPELINE SUCCESS!")
        print_success("Database is fully set up and verified")
        print()
        print(f"{BOLD}📊 Pipeline Summary:{RESET}")
        print(f"   ✅ Excel file created with sample data")
        print(f"   ✅ Database seeded with {BOLD}4 users, 15 tenants, 3 properties, 12 units{RESET}")
        print(f"   ✅ {BOLD}12 leases, 12 unit-tenants, 38 payments{RESET} created")
        print(f"   ✅ All foreign key relationships verified")
        print(f"   ⏱️  Total time: {duration:.1f} seconds")
        print()
        print(f"{BOLD}🔑 Test Credentials:{RESET}")
        print(f"   Admin: admin@assetplatform.com / admin123")
        print(f"   User:  ramesh_patel@example.com / owner123")
        print()
        print(f"{BOLD}🚀 Ready to start the application!{RESET}")
    elif success_count > 0:
        print_success(f"✅ PARTIAL PIPELINE SUCCESS!")
        print_success(f"Completed {success_count}/{len(steps)} steps successfully")
        print()
        print(f"{BOLD}📊 Partial Summary:{RESET}")
        if success_count >= 1:
            print(f"   ✅ Excel file created with sample data")
        if success_count >= 2:
            print(f"   ✅ Database seeded with sample data")
        if success_count >= 3:
            print(f"   ✅ Database integrity verified")
        print(f"   ⏱️  Total time: {duration:.1f} seconds")
    else:
        print_error("❌ NO STEPS COMPLETED")
        print_error("All steps were skipped or failed")

    print("=" * 80)

    # Cleanup
    cleanup_temp_files()

    # Exit with appropriate code
    sys.exit(0 if success_count == len(steps) else 1)

if __name__ == '__main__':
    main()