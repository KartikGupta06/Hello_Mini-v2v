import csv
import glob

csv_files = glob.glob('data/raw/*.csv')
for f in csv_files:
    with open(f, 'r', encoding='utf-8') as file:
        reader = csv.reader(file)
        header = next(reader)
        row = next(reader, None)
        print(f"--- {f} ---")
        print("Header:", header)
        print("Row:", row)
        print()
