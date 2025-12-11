#!/usr/bin/env python3
import os
import re
import sys

def remove_all_arabic(content):
    """Aggressively remove all Arabic text"""
    # Remove Arabic characters
    arabic_pattern = re.compile(r'[\u0600-\u06FF]+')
    content = arabic_pattern.sub('', content)

    # Clean up leftover patterns
    # Remove standalone dash surrounded by spaces
    content = re.sub(r'\s+-\s+', ' ', content)
    content = re.sub(r'-\s+', '', content)
    content = re.sub(r'\s+-', '', content)

    # Remove multiple spaces
    content = re.sub(r'  +', ' ', content)

    # Remove empty strings in JSX/TSX
    content = re.sub(r'<[^>]+>\s*</[^>]+>', '', content)

    # Fix lines that now have trailing dashes or spaces
    lines = []
    for line in content.split('\n'):
        line = line.rstrip('- ')
        line = line.replace(' ->', '->')
        line = line.replace('- ', '')
        lines.append(line)

    content = '\n'.join(lines)

    return content

def process_file(filepath):
    """Process a single file to remove ALL Arabic text"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if file contains Arabic
        if not re.search(r'[\u0600-\u06FF]', content):
            return False

        new_content = remove_all_arabic(content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}", file=sys.stderr)
        return False

def main():
    src_dir = 'src'
    modified_files = []

    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                filepath = os.path.join(root, file)
                if process_file(filepath):
                    modified_files.append(filepath)

    print(f"Modified {len(modified_files)} files")

    # Verify no Arabic remains
    remaining = 0
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        if re.search(r'[\u0600-\u06FF]', f.read()):
                            remaining += 1
                            print(f"Arabic still found in: {filepath}")
                except:
                    pass

    if remaining == 0:
        print("✓ All Arabic text has been successfully removed!")
    else:
        print(f"Warning: {remaining} files still contain Arabic text")

if __name__ == '__main__':
    main()
