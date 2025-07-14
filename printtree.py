import os

def print_directory_tree(startpath, max_depth=3, prefix=""):
    for root, dirs, files in os.walk(startpath):
        # Calculate the level of depth
        level = root.replace(startpath, '').count(os.sep)
        if level >= max_depth:
            continue
        indent = '│   ' * level + '├── '
        print(f"{indent}{os.path.basename(root)}/")
        subindent = '│   ' * (level + 1)
        for f in files:
            print(f"{subindent}└── {f}")

# Change this path to where your project root is (where "frontend" and "backend" live)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))  # assumes run from backend/
print(f"Project Folder Tree ({project_root}):\n")
print_directory_tree(project_root)
