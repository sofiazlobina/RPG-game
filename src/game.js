export function renderField(players, fieldWidth = 40) {
  const markers = {
    'Воин': '⚔️', 'Лучник': '🏹', 'Маг': '🔮',
    'Гном': '🪓', 'Арбалетчик': '🎯', 'Демиург': '🌟', 'Игрок': '👤'
  };

  const hpStatus = (cur, max) => {
    const r = cur / max;
    if (r > 0.7) return '[OK]  ';
    if (r > 0.4) return '[WARN]';
    if (r > 0.1) return '[LOW] ';
    return '[CRIT]';
  };

  // рисуем поле
  console.log('\n' + '─'.repeat(70));
  console.log(' 🗡️  ПОЛЕ ' + '─'.repeat(60));
  
  let line = '';
  for (let i = 0; i < fieldWidth; i++) {
    const p = players.find(x => !x.isDead() && ((x.position % fieldWidth + fieldWidth) % fieldWidth) === i);
    line += p ? (markers[p.description] || '?') : '·';
  }
  
  console.log(` │${line}│`);
  console.log(`  0${' '.repeat(fieldWidth - 2)}${fieldWidth - 1}`);
  console.log('─'.repeat(70));

  // статусы
  console.log('\n 📋 СТАТУС ГЕРОЕВ:');
  console.log('─'.repeat(70));
  console.log(`  ИМЯ          | КЛАС  | ❤️  HP  | ✨ МАНА | 🔫 ОРУЖИЕ      | 📍 ПОЗИЦИЯ`);
  console.log('─'.repeat(70));
  
  players.forEach(p => {
    if (p.isDead()) {
      console.log(`  💀 ${p.name.padEnd(12)} | МЁРТВ`);
      return;
    }
    
    const maxHP = { Dwarf: 130, Warrior: 120, Archer: 80, Crossbowman: 85, Mage: 70, Demiurge: 80 }[p.constructor.name] || 100;
    const wpn = p.weapon.name.length > 12 ? p.weapon.name.slice(0, 11) + '…' : p.weapon.name.padEnd(12);
    
    console.log(
      `  ${markers[p.description] || '?'} ${p.name.padEnd(12)} | ` +
      `${p.description.padEnd(5)} | ` +
      `${hpStatus(p.life, maxHP)} ${Math.round(p.life).toString().padStart(3)} | ` +
      `${Math.round(p.magic).toString().padStart(4)} | ` +
      `${wpn} (${Math.round(p.weapon.durability).toString().padStart(3)}) | ` +
      `${p.position.toString().padStart(2)}`
    );
  });
  console.log('─'.repeat(70) + '\n');
}

export function play(players, maxRounds = 100) {
  console.log('🎮 НАЧАЛО БИТВЫ! 🎮\n');
  
  for (let round = 1; round <= maxRounds; round++) {
    console.log(`\n=== РАУНД ${round} ===`);
    renderField(players);
    
    const alive = players.filter(p => !p.isDead());
    if (alive.length <= 1) break;
    
    for (const p of players) {
      if (p.isDead()) continue;
      p.turn(players);
      
      const survivors = players.filter(x => !x.isDead());
      if (survivors.length === 1) {
        renderField(players);
        console.log(`\n🏆 ПОБЕДИТЕЛЬ: ${survivors[0].name}! 🏆`);
        return survivors[0];
      }
    }
  }
  
  renderField(players);
  
  const winner = players
    .filter(p => !p.isDead())
    .reduce((best, cur) => cur.life > best.life ? cur : best, { life: -1, name: 'Никто' });
  
  console.log(`\n⏰ Лимит раундов исчерпан!`);
  console.log(`🏆 ПОБЕДИТЕЛЬ ПО ОЧКАМ: ${winner.name} (${winner.description}) с ${Math.ceil(winner.life)} HP`);
  return winner;
}