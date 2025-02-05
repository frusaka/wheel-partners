const { readFileSync, writeFileSync } = require("fs");
const { Student } = require("./data.js");
const { generate, stringify } = require("./index.js");

const FILENAME = "test-subjects";
const AMOUNT = 12;

function main() {
  save(generate(load(FILENAME), AMOUNT), FILENAME);
}

function load(filename) {
  const data = JSON.parse(readFileSync(`./${filename}.json`));

  const studentsData = new Map(Object.entries(data));
  return Array.from(studentsData.keys()).map(
    (name, idx) => new Student(name, idx, studentsData.get(name))
  );
}

function save(students, filename) {
  writeFileSync(`output/${filename}.txt`, stringify(students));
}

main();
