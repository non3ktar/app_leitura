import re

with open('../farmando_aura/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

js = re.search(r'<script>(.*?)</script>', html.split('<!-- Scripts -->')[1], re.DOTALL).group(1)
with open('aura_logic.js', 'w', encoding='utf-8') as f:
    f.write(js)
