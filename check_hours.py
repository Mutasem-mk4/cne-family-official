
import json
from pathlib import Path

curriculum_path = Path(__file__).resolve().parent / 'public' / 'data' / 'curriculum.json'

with curriculum_path.open('r', encoding='utf-8') as f:
    data = json.load(f)

subjects = data['curriculum']

common = sum(s['credits'] for s in subjects if s['major'] == 'common')
comp_only = sum(s['credits'] for s in subjects if s['major'] == 'computer')
net_only = sum(s['credits'] for s in subjects if s['major'] == 'network')

print(f"Common: {common}")
print(f"Computer Major Total: {common + comp_only}")
print(f"Network Major Total: {common + net_only}")
