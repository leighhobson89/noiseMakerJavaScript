import os
import shutil
import subprocess
import argparse
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# List of files and directories to ignore
IGNORE_LIST = [
    '.gitignore',
    'utilities',
    'package.json',
    'package-lock.json',
    '.git',
    'node_modules',
    'noiseMakerJavascriptDesktop'
]

def clean_build_directory(builds_dir):
    """Delete everything in the builds directory."""
    if os.path.exists(builds_dir):
        logging.info(f"Cleaning build directory: {builds_dir}")
        shutil.rmtree(builds_dir)  # Remove the entire builds directory
    os.makedirs(builds_dir, exist_ok=True)  # Recreate it

def copy_files_to_desktop(src_dir, dest_dir):
    """Copy files from src_dir to dest_dir, ignoring files in the IGNORE_LIST."""
    logging.info(f"Copying files from {src_dir} to {dest_dir}")

    for root, dirs, files in os.walk(src_dir):
        # Update directories to ignore
        dirs[:] = [d for d in dirs if d not in IGNORE_LIST]
        for file_name in files:
            if file_name in IGNORE_LIST:
                logging.info(f"Ignoring file: {os.path.join(root, file_name)}")
                continue

            # Create source file path
            src_file_path = os.path.join(root, file_name)

            rel_path = os.path.relpath(root, start=src_dir)  # Relative to the parent directory of utilities

            # Construct the destination file path without including 'utilities'
            if rel_path.startswith(".."):  # Handle any relative paths that go upwards
                dest_file_path = os.path.join(dest_dir, file_name)  # Just copy the file without path
            else:
                dest_file_path = os.path.join(dest_dir, rel_path, file_name)

            # Ensure the destination directory exists
            os.makedirs(os.path.dirname(dest_file_path), exist_ok=True)

            logging.info(f"Copying {src_file_path} to {dest_file_path}")
            shutil.copy2(src_file_path, dest_file_path)  # This will overwrite if it exists

def minify_files(root_dir):
    """Minify JavaScript and HTML files in the specified directory, excluding files in IGNORE_LIST."""
    for root, dirs, files in os.walk(root_dir):
        for file_name in files:
            # Skip files that are in the IGNORE_LIST
            if file_name in IGNORE_LIST:
                logging.info(f"Ignoring file for minification: {os.path.join(root, file_name)}")
                continue

            file_path = os.path.join(root, file_name)

            if file_name.endswith('.js'):
                logging.info(f"Minifying JavaScript: {file_path}")
                try:
                    subprocess.run(f"npx terser {file_path} -o {file_path} --compress --mangle", shell=True, check=True)
                except subprocess.CalledProcessError as e:
                    logging.error(f"Error minifying JavaScript: {e}")

            elif file_name.endswith('.html'):
                logging.info(f"Minifying HTML: {file_path}")
                try:
                    subprocess.run(f"npx html-minifier --collapse-whitespace --remove-comments --minify-css true --minify-js true -o {file_path} {file_path}", shell=True, check=True)
                except subprocess.CalledProcessError as e:
                    logging.error(f"Error minifying HTML: {e}")

def run_npm_build(project_dir):
    """Run npm build in the specified project directory."""
    logging.info(f"Running npm build in {project_dir}")

    # Check if package.json exists
    package_json_path = os.path.join(project_dir, 'package.json')
    if not os.path.isfile(package_json_path):
        logging.error(f"package.json not found in {project_dir}. Please check your project structure.")
        return

    # Log the current working directory to confirm
    logging.info(f"Current working directory before build: {os.getcwd()}")

    try:
        # Attempt to run the npm build command
        result = subprocess.run(["npm", "run", "build"], cwd=project_dir, check=True, shell=True)
        logging.info("NPM build completed successfully.")
    except subprocess.CalledProcessError as e:
        logging.error(f"NPM build failed with error: {e}")
    except FileNotFoundError:
        logging.error("npm is not found. Please ensure that Node.js is installed and added to your PATH.")

def main():
    # Set up argument parsing
    parser = argparse.ArgumentParser(description='Build the Electron application.')
    parser.add_argument('build_name', type=str, help='The argument to include in the build process.')

    args = parser.parse_args()

    # Define paths
    current_dir = os.getcwd()
    builds_dir = os.path.join(current_dir, '../noiseMakerJavascriptDesktop/builds')
    src_dir = os.path.dirname(current_dir)  # Parent directory
    dest_dir = os.path.join(current_dir, '../noiseMakerJavascriptDesktop')

    # Clean the builds directory
    clean_build_directory(builds_dir)

    # Copy files to the Electron project directory
    copy_files_to_desktop(src_dir, dest_dir)

    # # Minify files in the destination directory
    # minify_files(dest_dir)   NOT WORKING BECAUSE IT MINIFIES EVERYTHING EVEN NODE FILES

    # Run npm build
    run_npm_build(dest_dir)

if __name__ == '__main__':
    main()
