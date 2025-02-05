const studentList = JSON.parse(localStorage.getItem("student-list") || "[]");

document
  .getElementById("new-student-name")
  .addEventListener("keyup", (event) =>
    event.key == "Enter" ? addStudent() : null
  );
document
  .getElementById("js-add-student-button")
  .addEventListener("click", addStudent);

renderStudentList();

function addStudent() {
  const studentName = document.getElementById("new-student-name").value;
  document.getElementById("new-student-name").value = "";
  studentList.unshift({
    name: studentName,
    requests: [""],
    exclude: [""],
  });
  localStorage.setItem("student-list", JSON.stringify(studentList));
  renderStudentList();
}

function removeStudent(index) {
  studentList.splice(index, 1);
  localStorage.setItem("student-list", JSON.stringify(studentList));
  renderStudentList();
}

function renderStudentList() {
  let todoHTML = "";
  studentList.forEach((student) => {
    todoHTML += `
    <div>
      <table>
        <tr>
          <td><h3 contenteditable>${student.name}</h3></td>
          <td><button class="delete-student js-delete-student-button">Remove</button></td>
        </tr>
        <tr>
          <th>Requests</th>
          <th>Exclude</th>
        </tr>
        <tr>
          <td contenteditable class=js-req-inp>
            ${student.requests.join("\n")}
          </td>
          <td contenteditable class=js-ex-inp>
            ${student.exclude.join("\n")}
          </td>
        </tr>
      </table>
    </div>`;
  });

  document.getElementById("js-student-list").innerHTML = todoHTML;
  document
    .querySelectorAll(".js-delete-student-button")
    .forEach((jsButton, index) =>
      jsButton.addEventListener("click", () => removeStudent(index))
    );

  // Save settings
  document.querySelectorAll(".js-req-inp").forEach((entry, idx) => {
    entry.addEventListener("keyup", () => {
      studentList[idx].requests = entry.innerHTML.split("\n");
      localStorage.setItem("student-list", JSON.stringify(studentList));
    });
  });
  document.querySelectorAll(".js-ex-inp").forEach((entry, idx) => {
    entry.addEventListener("keyup", () => {
      studentList[idx].exclude = entry.innerHTML.split("\n");
      localStorage.setItem("student-list", JSON.stringify(studentList));
    });
  });
}
