import pandas as pd
import json

# Load CSV in chunks to handle large files efficiently
chunksize = 100000  # Adjust based on memory capacity
csv_file = "../model/dataset1.csv"  # Update with your file path
json_file = "products.json"

# Convert CSV to JSON in chunks and write to a file
with open(json_file, "w", encoding="utf-8") as f:
    for chunk in pd.read_csv(csv_file, chunksize=chunksize):
        records = chunk.to_dict(orient="records")
        for record in records:
            f.write(json.dumps(record) + "\n")  # Line-by-line JSONL format (more efficient)
            
print(f"JSON file saved as {json_file}")
