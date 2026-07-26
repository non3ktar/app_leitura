import re

with open('../farmando_aura/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_logic = r"""
                    row.innerHTML = `
                        <div class="flex items-center gap-4">
                            ${rankBadge}
                            <div class="flex items-center justify-center w-10 h-10 text-2xl">${av}</div>
                            <span class="font-bold text-lg text-white">${player.student_name}</span>
                        </div>
                        <div class="font-display font-black text-xl text-brand-400">${player.score}</div>
                    `;
"""

new_logic = r"""
                    const isPlatinado = player.score >= 1000;
                    const badge = isPlatinado ? '<span class="text-[10px] bg-yellow-500 text-black font-bold px-2 py-1 rounded ml-2 shadow-[0_0_10px_rgba(234,179,8,0.5)]">🎖️ PLATINOU</span>' : '';
                    if (isPlatinado) {
                        row.className = `flex items-center justify-between p-4 mb-2 rounded-xl bg-yellow-900/20 border border-yellow-400/50 hover:bg-white/10 transition-all`;
                    }
                    const scoreColor = isPlatinado ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'text-brand-400';

                    row.innerHTML = `
                        <div class="flex items-center gap-4">
                            ${rankBadge}
                            <div class="flex items-center justify-center w-10 h-10 text-2xl">${av}</div>
                            <span class="font-bold text-lg text-white flex items-center">${player.student_name} ${badge}</span>
                        </div>
                        <div class="font-display font-black text-xl ${scoreColor}">${player.score}</div>
                    `;
"""

html = re.sub(old_logic.strip().replace(' ', r'\s*').replace('\n', r'\s*'), new_logic.strip(), html, flags=re.DOTALL)

with open('../farmando_aura/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
