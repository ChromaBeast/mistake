import json

with open("blog-automation-86940-829f42d14c1c.json") as f:
    data = json.load(f)

print(json.dumps(data, separators=(",", ":")))
