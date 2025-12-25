import os
import sys
import pandas as pd
import glob
import shutil

import pytest




def setup_seed_excel(tmp_path):
    # Create minimal seed data Excel
    seed_dir = tmp_path / "scripts" / "seed_data"
    seed_dir.mkdir(parents=True, exist_ok=True)
    file_path = seed_dir / "seed_data.xlsx"

    df_users = pd.DataFrame([
        {'key': 'admin', 'username': 'admin', 'email': 'admin@example.com', 'password_plain': 'admin123'}
    ])

    with pd.ExcelWriter(str(file_path)) as writer:
        df_users.to_excel(writer, sheet_name='users', index=False)

    return str(file_path)


def test_dry_run_creates_summary(tmp_path, monkeypatch):
    # Prepare minimal seed excel
    seed_file = setup_seed_excel(tmp_path)

    # Ensure scripts/seed_data exists in repo for the run
    repo_seed_dir = os.path.join(os.getcwd(), 'scripts', 'seed_data')
    if os.path.exists(repo_seed_dir):
        backup_dir = repo_seed_dir + '_bak'
        if os.path.exists(backup_dir):
            shutil.rmtree(backup_dir)
        shutil.move(repo_seed_dir, backup_dir)
    os.makedirs(repo_seed_dir, exist_ok=True)
    shutil.copy(seed_file, os.path.join(repo_seed_dir, 'seed_data.xlsx'))

    # Ensure module importable from repo root
    repo_python_dir = os.path.abspath(os.path.join(os.getcwd(), 'db', 'seeds', 'python'))
    if repo_python_dir not in sys.path:
        sys.path.insert(0, repo_python_dir)

    from seed_to_db import main

    # Run main in dry-run non-interactive mode
    monkeypatch.setattr(sys, 'argv', ['seed_to_db.py', '--dry-run', '--seed', '-y'])
    main()

    # Expect a summary JSON in logs
    logs = glob.glob(os.path.join('logs', 'seed_summary_*.json'))
    assert len(logs) > 0

    # Cleanup: remove temporary seed dir and restore backup if any
    shutil.rmtree(repo_seed_dir)
    if os.path.exists(repo_seed_dir + '_bak'):
        shutil.move(repo_seed_dir + '_bak', repo_seed_dir)
