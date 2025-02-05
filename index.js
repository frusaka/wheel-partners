const { Student, Mask } = require("./data.js");

function bitCount(n) {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return (((n + (n >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24;
}

function rank(students) {
  students.sort((student) =>
    Array.from(student.prefs.values()).reduce((a, b) => a + b, 0)
  );
  for (let idx = 0; idx < students.length; idx++) students[idx].id = idx;
}

function optimalSchedule(students, mask, day) {
  if (!mask.val) return 1;
  let student = students[mask.minTrueIndex()];
  if (bitCount(mask.val) == 1) {
    if (student.partners.includes("None")) return 0;
    student.partners[day] = "None";
    return 1;
  }
  let other = student.chooseRandom(mask);
  // console.log(other);
  if (!other) return 0;

  if (other.name == student.partners[day - 1]) {
    other = student.chooseRandom(mask.switch([other.id], 0));
    if (!other) return 0;
  }

  let pending = mask.switch([student.id], 0);
  while (
    !optimalSchedule(students, mask.switch([student.id, other.id], 0), day)
  ) {
    if (!pending.val) return 0;
    student = students[pending.minTrueIndex()];
    other = student.chooseRandom(mask);
    if (!other) return 0;
    pending = pending.switch([student.id], 0);
  }
  student.pair(other, day);
  return 1;
}

function generate(students, amount = 12) {
  Student.AMOUNT = amount;

  // Loading preferences
  students.forEach((student) => {
    student.loadPrefs(students);
    if (student.prefs.length < Student.AMOUNT) {
      Student.MAX_OCCURANCE = Math.max(
        Student.MAX_OCCURANCE,
        Student.AMOUNT - student.prefs.length + 1
      );
    }
  });

  // Generating schedule
  for (let day = 0; day < Student.AMOUNT; day++) {
    rank(students);
    optimalSchedule(students, new Mask(students.length), day);
  }

  return students;
}

function stringify(students) {
  let res = "";
  for (const student of students) {
    res += `${student.name}:\n\t`;
    res += student.partners
      .map((val, idx) => `${idx + 1}. ${val}`)
      .join("\n\t");
    res += "\n\n";
  }

  return res;
}

module.exports.generate = generate;
module.exports.stringify = stringify;
