import re
from datetime import datetime, timezone

INPUT_FILE = "db.sql"
OUTPUT_FILE = "output.sql"

pattern = re.compile(r",\s*(\d{13})\s*\);$")

def ms_to_datetime(ms):
    return datetime.fromtimestamp(int(ms) / 1000, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

with open(INPUT_FILE, "r", encoding="utf-8") as infile, open(OUTPUT_FILE, "w", encoding="utf-8") as outfile:
    for line in infile:
        match = pattern.search(line)
        if not match:
            outfile.write(line)
            continue

        updated_at = ms_to_datetime(match.group(1))

        new_line = pattern.sub(
            f", '{updated_at}');",
            line
        )

        outfile.write(new_line)
