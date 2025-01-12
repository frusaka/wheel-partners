function Counter(array) {
  const counts = new Map();
  for (const item of array) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  return counts;
}

class Mask {
  constructor(size = null, val = null) {
    if (size !== null) this.val = (1 << size) - 1;
    else this.val = val;
  }

  at(index) {
    return Boolean(this.val & (1 << index));
  }

  minTrueIndex() {
    if (!this.val) {
      return -1;
    }
    return Math.floor(Math.log2(this.val & -this.val));
  }

  switch(indices, value) {
    let res = this.val;
    for (const idx of indices) {
      if (value) res |= 1 << idx;
      else res &= ~(1 << idx);
    }
    return new Mask(null, res);
  }
}

class Student {
  MAX_OCCURANCE = 1;
  AMOUNT = 12;

  constructor(name, id, settings) {
    this.name = name;
    this.id = id;
    this.requests = settings.requests;
    this.exclude = settings.exclude;
    this.prefs = new Map();
    this.partners = Array(Student.AMOUNT).fill(null);
  }

  loadPrefs(students) {
    for (const student of students) {
      if (
        student === this ||
        this.exclude.includes(student.name) ||
        student.exclude.includes(this.name)
      )
        continue;
      if (
        this.requests.includes(student.name) &&
        student.requests.includes(this.name)
      )
        this.prefs.set(student, 3);
      else if (this.requests.includes(student.name))
        this.prefs.set(student, 1.75);
      else if (student.requests.includes(this.name)) this.prefs.set(student, 1);
      else this.prefs.set(student, 0.4);
    }
  }

  isValidPartner(other) {
    const counts = Counter(this.partners.filter(Boolean));
    if (!counts.size) return true;
    return Boolean(
      Math.max(Math.max(...counts.values()), 0) < this.MAX_OCCURANCE ||
        !this.partners.includes(other.name)
    );
  }

  pair(other, day) {
    if (!this.isValidPartner(other)) return;

    this.partners[day] = other.name;
    other.partners[day] = this.name;

    if (!this.isValidPartner(other)) {
      this.prefs.delete(other);
      other.prefs.delete(this);
      return;
    }
    this.prefs.set(other, this.prefs.get(other) * 0.1);
    other.prefs.set(this, other.prefs.get(this) * 0.1);
  }

  chooseRandom(mask) {
    const available = [];
    const weights = [];
    for (const student of Array.from(this.prefs.keys()).filter((item) =>
      mask.at(item.id)
    )) {
      if (!this.isValidPartner(student)) continue;
      available.push(student);
      weights.push(this.prefs.get(student));
    }
    if (!available.length) return;
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    for (const other of available) {
      const weight = this.prefs.get(other);
      if (random < weight) {
        return other;
      }
      random -= weight;
    }
  }
}

module.exports.Student = Student;
module.exports.Mask = Mask;
