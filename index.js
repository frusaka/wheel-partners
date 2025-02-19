// Condensed to one file to make it work with html-preview

let maxOccurance = 1;

const studentsData =
  JSON.parse(localStorage.getItem("wheels-partners-names")) || {};

const amountInput = document.getElementById("amount");
const amountLabel = document.getElementById("amount-label");

amountInput.addEventListener("input", () => {
  amountLabel.textContent = amountInput.value;
});
document
  .getElementById("new-student-name")
  .addEventListener("keyup", (event) =>
    event.key == "Enter" ? addStudent() : null
  );
document
  .getElementById("js-add-student-button")
  .addEventListener("click", addStudent);
document
  .getElementById("js-generate-button")
  .addEventListener("click", generate);

renderStudentList();

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
  constructor(name, id, settings) {
    this.name = name;
    this.id = id;
    this.requests = settings.requests;
    this.exclude = settings.exclude;
    this.prefs = new Map();
    this.partners = Array(amountInput.value).fill(null);
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
      Math.max(Math.max(...counts.values()), 0) < maxOccurance ||
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

function generate() {
  const data = new Map(Object.entries(studentsData));
  const students = Array.from(data.keys()).map(
    (name, idx) => new Student(name, idx, data.get(name))
  );
  // Loading preferences
  students.forEach((student) => {
    student.loadPrefs(students);
    if (student.prefs.size < amountInput.value) {
      maxOccurance = Math.max(
        maxOccurance,
        amountInput.value - student.prefs.size + 1
      );
    }
  });
  // Generating schedule
  for (let day = 0; day < amountInput.value; day++) {
    rank(students);
    optimalSchedule(students, new Mask(students.length), day);
  }
  document.getElementById("js-output").innerText = stringify(students);
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

function addStudent() {
  const studentName = document.getElementById("new-student-name").value;
  document.getElementById("new-student-name").value = "";
  studentsData[studentName] = {
    requests: [""],
    exclude: [""],
  };
  localStorage.setItem("wheels-partners-names", JSON.stringify(studentsData));
  renderStudentList();
}

function removeStudent(name) {
  delete studentsData[name];
  localStorage.setItem("wheels-partners-names", JSON.stringify(studentsData));
  renderStudentList();
}

function renderStudentList() {
  let todoHTML = "";
  for (const [name, prefs] of Object.entries(studentsData)) {
    todoHTML += `
    <div>
      <table>
        <tr class="student-header">
          <td class="student-name">${name}</td>
          <td>
            <button class="delete-student js-delete-student-button" data-student-name="${name}">-</button>
          </td>
        </tr>
        <tr>
          <th class=requests>Requests</th>
          <th class=exclude>Exclude</th>
        </tr>
        <tr>
          <td contenteditable class=js-req-inp data-student-name="${name}">
            ${prefs.requests.join("<br>")}
          </td>
          <td contenteditable class=js-ex-inp data-student-name="${name}">
            ${prefs.exclude.join("<br>")}
          </td>
        </tr>
      </table>
    </div>`;
  }

  document.getElementById("js-student-list").innerHTML = todoHTML;
  document
    .querySelectorAll(".js-delete-student-button")
    .forEach((jsButton) =>
      jsButton.addEventListener("click", () =>
        removeStudent(jsButton.dataset.studentName)
      )
    );

  // Save settings
  document.querySelectorAll(".js-req-inp").forEach((entry, idx) => {
    entry.addEventListener("keyup", () => {
      studentsData[entry.dataset.studentName].requests =
        entry.innerText.split("\n");
      localStorage.setItem(
        "wheels-partners-names",
        JSON.stringify(studentsData)
      );
    });
  });
  document.querySelectorAll(".js-ex-inp").forEach((entry, idx) => {
    entry.addEventListener("keyup", () => {
      studentsData[entry.dataset.studentName].exclude =
        entry.innerText.split("\n");
      localStorage.setItem(
        "wheels-partners-names",
        JSON.stringify(studentsData)
      );
    });
  });
}
