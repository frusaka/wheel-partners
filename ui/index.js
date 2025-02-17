import { Student } from "../data.js";
import { generate, stringify } from "../index.js";

const studentsData =
  JSON.parse(localStorage.getItem("wheels-partners-names")) || {};

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
  .addEventListener("click", generateWheel);
renderStudentList();

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

function generateWheel() {
  const data = new Map(Object.entries(studentsData));
  const students = Array.from(data.keys()).map(
    (name, idx) => new Student(name, idx, data.get(name))
  );
  document.getElementById("js-output").innerText = stringify(
    generate(students, document.getElementById("amount").value)
  );
}

function renderStudentList() {
  let todoHTML = "";
  for (const [name, prefs] of Object.entries(studentsData)) {
    todoHTML += `
    <div>
      <table>
        <tr>
          <td><h3>${name}</h3></td>
          <td><button class="delete-student js-delete-student-button" data-student-name="${name}">Remove</button></td>
        </tr>
        <tr>
          <th>Requests</th>
          <th>Exclude</th>
        </tr>
        <tr>
          <td contenteditable class=js-req-inp data-student-name="${name}">
            ${prefs.requests.join("\n")}
          </td>
          <td contenteditable class=js-ex-inp data-student-name="${name}">
            ${prefs.exclude.join("\n")}
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
      console.log(studentsData, entry.dataset.studentName);
      studentsData[entry.dataset.studentName].requests =
        entry.innerHTML.split("\n");
      localStorage.setItem(
        "wheels-partners-names",
        JSON.stringify(studentsData)
      );
    });
  });
  document.querySelectorAll(".js-ex-inp").forEach((entry, idx) => {
    entry.addEventListener("keyup", () => {
      studentsData[entry.dataset.studentName].exclude =
        entry.innerHTML.split("\n");
      localStorage.setItem(
        "wheels-partners-names",
        JSON.stringify(studentsData)
      );
    });
  });
}
