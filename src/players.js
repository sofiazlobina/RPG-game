import { 
  Arm, Bow, Sword, Knife, Staff, 
  LongBow, Axe, StormStaff 
} from './weapons.js';

export class Player {
  constructor(position, name) {
    this.life = 100;
    this.magic = 20;
    this.speed = 1;
    this.attack = 10;
    this.agility = 5;
    this.luck = 10;
    this.description = 'Игрок';
    this.weapon = new Arm();
    this.position = position;
    this.name = name;
    this._hitCounter = 0;
  }

  getLuck() {
    return (Math.random() * 100 + this.luck) / 100;
  }

  getDamage(distance) {
    if (distance > this.weapon.range) return 0;
    return (this.attack + this.weapon.getDamage()) * this.getLuck() / distance;
  }

  takeDamage(damage) {
    this.life = Math.max(0, this.life - damage);
  }

  isDead() {
    return this.life === 0;
  }

  move(distance) {
    const step = Math.min(Math.abs(distance), this.speed) * Math.sign(distance || 1);
    this.position += step;
  }

  isAttackBlocked() {
    return this.getLuck() > (100 - this.luck) / 100;
  }

  dodged() {
    return this.getLuck() > (100 - this.agility - this.speed * 3) / 100;
  }

  takeAttack(damage) {
    if (this.isAttackBlocked()) {
      this.weapon.takeDamage(damage);
      console.log(`${this.name} заблокировал удар!`);
      return;
    }
    if (this.dodged()) {
      console.log(`${this.name} уклонился от атаки!`);
      return;
    }
    this.takeDamage(damage);
    console.log(`${this.name} получил урон ${damage.toFixed?.(2) ?? damage}. Жизни: ${this.life}`);
  }

  checkWeapon() {
    if (this.weapon.isBroken()) {
      const next = this._getNextWeapon();
      if (next) {
        console.log(`${this.name}: оружие сломано! Теперь использует ${next.name}`);
        this.weapon = next;
      }
    }
  }

  _getNextWeapon() {
    return null;
  }

  tryAttack(enemy) {
    const distance = Math.abs(this.position - enemy.position);
    
    if (distance > this.weapon.range) {
      console.log(`${this.name} не достаёт до ${enemy.name}`);
      return;
    }

    this.weapon.takeDamage(10 * this.getLuck());
    let damage = this.getDamage(distance);
    
    if (this.position === enemy.position) {
      enemy.position += 1;
      enemy.takeAttack(damage * 2);
    } else {
      enemy.takeAttack(damage);
    }
    this.checkWeapon();
  }

  chooseEnemy(players) {
    const alive = players.filter(p => p !== this && !p.isDead());
    if (!alive.length) return null;
    return alive.reduce((min, p) => p.life < min.life ? p : min);
  }

  moveToEnemy(enemy) {
    if (!enemy) return;
    this.move((enemy.position > this.position ? 1 : -1) * this.speed);
  }

  turn(players) {
    if (this.isDead()) return;
    const enemy = this.chooseEnemy(players);
    if (!enemy || enemy.isDead()) return;
    
    console.log(`\n=== Ход ${this.name} (${this.description}) ===`);
    this.moveToEnemy(enemy);
    this.tryAttack(enemy);
  }
}

// --- базовые классы ---

export class Warrior extends Player {
  constructor(position, name) {
    super(position, name);
    this.life = 120;
    this.speed = 2;
    this.description = 'Воин';
    this.weapon = new Sword();
  }

  _getNextWeapon() {
    if (this.weapon instanceof Sword) return new Knife();
    if (this.weapon instanceof Knife) return new Arm();
    return null;
  }

  takeDamage(damage) {
    // рывок ярости при низком ХП
    if (this.life < 60 && this.getLuck() > 0.8 && this.magic > 0) {
      this.magic = Math.max(0, this.magic - damage);
      console.log(`${this.name} отразил урон маной!`);
      return;
    }
    super.takeDamage(damage);
  }
}

export class Archer extends Player {
  constructor(position, name) {
    super(position, name);
    this.life = 80;
    this.magic = 35;
    this.attack = 5;
    this.agility = 10;
    this.description = 'Лучник';
    this.weapon = new Bow();
  }

  _getNextWeapon() {
    if (this.weapon instanceof Bow) return new Knife();
    if (this.weapon instanceof Knife) return new Arm();
    return null;
  }

  getDamage(distance) {
    if (distance > this.weapon.range) return 0;
    // урон растёт с дистанцией (в пределах досягаемости)
    return (this.attack + this.weapon.getDamage()) * this.getLuck() * distance / this.weapon.range;
  }
}

export class Mage extends Player {
  constructor(position, name) {
    super(position, name);
    this.life = 70;
    this.magic = 100;
    this.attack = 5;
    this.agility = 8;
    this.description = 'Маг';
    this.weapon = new Staff();
  }

  _getNextWeapon() {
    if (this.weapon instanceof Staff) return new Knife();
    if (this.weapon instanceof Knife) return new Arm();
    return null;
  }

  takeDamage(damage) {
    if (this.magic > 50) {
      const reduced = damage / 2;
      this.magic = Math.max(0, this.magic - 12);
      console.log(`${this.name} использовал щит! Урон: ${reduced.toFixed(2)}`);
      super.takeDamage(reduced);
      return;
    }
    super.takeDamage(damage);
  }

  castSpell(enemy) {
    if (!enemy || enemy.isDead() || this.magic < 10) {
      if (this.magic < 10) console.log(`${this.name}: недостаточно маны для заклинания!`);
      return;
    }
    this.magic -= 10;
    const dmg = this.attack * 2 * this.getLuck();
    console.log(`✨ ${this.name} кастует заклинание на ${enemy.name}! Урон: ${dmg.toFixed(2)}`);
    enemy.takeAttack(dmg);
  }
}

// --- улучшенные классы ---

export class Dwarf extends Warrior {
  constructor(position, name) {
    super(position, name);
    this.life = 120;
    this.attack = 15;
    this.luck = 20;
    this.description = 'Гном';
    this.weapon = new Axe();
  }

  _getNextWeapon() {
    if (this.weapon instanceof Axe) return new Knife();
    if (this.weapon instanceof Knife) return new Arm();
    return null;
  }

  takeDamage(damage) {
    this._hitCounter++;
    // парирование каждые 6 ударов
    if (this._hitCounter % 6 === 0 && this.getLuck() > 0.5) {
      console.log(`${this.name} парировал удар!`);
      super.takeDamage(damage / 2);
      return;
    }
    // ярость как у воина
    if (this.life < 65 && this.getLuck() > 0.8 && this.magic > 0) {
      this.magic = Math.max(0, this.magic - damage);
      return;
    }
    super.takeDamage(damage);
  }
}

export class Crossbowman extends Archer {
  constructor(position, name) {
    super(position, name);
    this.life = 85;
    this.attack = 8;
    this.agility = 20;
    this.luck = 15;
    this.description = 'Арбалетчик';
    this.weapon = new LongBow();
  }

  _getNextWeapon() {
    if (this.weapon instanceof LongBow) return new Knife();
    if (this.weapon instanceof Knife) return new Arm();
    return null;
  }
}

export class Demiurge extends Mage {
  constructor(position, name) {
    super(position, name);
    this.life = 80;
    this.magic = 120;
    this.attack = 6;
    this.luck = 12;
    this.description = 'Демиург';
    this.weapon = new StormStaff();
  }

  _getNextWeapon() {
    if (this.weapon instanceof StormStaff) return new Knife();
    if (this.weapon instanceof Knife) return new Arm();
    return null;
  }

  getDamage(distance) {
    let dmg = super.getDamage(distance);
    if (this.magic > 0 && this.getLuck() > 0.6) {
      console.log(`${this.name} усиливает атаку магией!`);
      return dmg * 1.5;
    }
    return dmg;
  }

  castSpell(enemy) {
    if (!enemy || enemy.isDead() || this.magic < 15) {
      if (this.magic < 15) console.log(`${this.name}: недостаточно маны для заклинания!`);
      return;
    }
    this.magic -= 15;
    const dmg = this.attack * 3 * this.getLuck();
    console.log(`🌟 ${this.name} кастует мощное заклинание на ${enemy.name}! Урон: ${dmg.toFixed(2)}`);
    enemy.takeAttack(dmg);
  }
}