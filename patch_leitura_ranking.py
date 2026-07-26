import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

leaderboard_logic = r"""
            uniqueArr.forEach((p, idx) => {
                const isPlatinado = p.final_probability >= 1000;
                const borderClass = isPlatinado ? 'border-yellow-400/50 bg-yellow-900/20' : 'border-white/5 bg-dark-800/50';
                const scoreColor = isPlatinado ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'text-brand-300';
                const badge = isPlatinado ? '<span class="text-xs bg-yellow-500 text-black font-bold px-2 py-1 rounded-md ml-2 inline-flex items-center gap-1 shadow-lg shadow-yellow-500/20"><span class="text-[10px]">🎖️</span> PLATINADO</span>' : '';
                
                const div = document.createElement('div');
                div.className = `flex items-center justify-between p-4 mb-2 rounded-xl ${borderClass} hover:bg-white/10 transition-colors border`;
                div.innerHTML = `
                    <div class="flex items-center gap-4">
                        <span class="text-2xl font-black text-slate-600 w-6">${idx + 1}</span>
                        <span class="text-xl">👤</span>
                        <div>
                            <div class="font-bold text-white flex items-center">${p.student_name} ${badge}</div>
                            <div class="text-xs text-brand-400">${p.book}</div>
                        </div>
                    </div>
                    <div class="text-xl font-black ${scoreColor}">${p.final_probability} ⚡</div>
                `;
                list.appendChild(div);
            });
"""

# The existing map logic
old_logic = r"""
            uniqueArr.forEach\(\(p, idx\) => \{
                const div = document\.createElement\('div'\);
                div\.className = "flex items-center justify-between p-4 mb-2 rounded-xl bg-dark-800/50 border border-white/5 hover:bg-white/5 transition-colors";
                div\.innerHTML = `
                    <div class="flex items-center gap-4">
                        <span class="text-2xl font-black text-slate-600 w-6">\$\{idx \+ 1\}</span>
                        <span class="text-xl">👤</span>
                        <div>
                            <div class="font-bold text-white">\$\{p\.student_name\}</div>
                            <div class="text-xs text-brand-400">\$\{p\.book\}</div>
                        </div>
                    </div>
                    <div class="text-xl font-black text-brand-300">\$\{p\.final_probability\} ⚡</div>
                `;
                list\.appendChild\(div\);
            \}\);
"""

# Strip out whitespace mismatch if necessary by just doing a regex sub
js = re.sub(old_logic.strip().replace(' ', r'\s*').replace('\n', r'\s*'), leaderboard_logic.strip(), js, flags=re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
