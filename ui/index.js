const studentList = JSON.parse(localStorage.getItem("student-list") || "[]");
const DEFAULT_SIZE = 6;
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
  studentList.push({
    name: studentName,
    requests: [""],
    exclude: [""],
  });
  localStorage.setItem("student-list", JSON.stringify(studentList));
  renderStudentList();
}

function removeTodo(index) {
  studentList.splice(index, 1);
  localStorage.setItem("student-list", JSON.stringify(studentList));
  renderStudentList();
}

function renderStudentList() {
  let todoHTML = "";
  studentList.forEach((student) => {
    todoHTML += `
    <div class>
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
          <td contenteditable></td>
          <td contenteditable></td>
        </tr>
      </table>
      </div>`;
  });
  document.getElementById("js-student-list").innerHTML = todoHTML;
  document
    .querySelectorAll(".js-delete-student-button")
    .forEach((jsButton, index) =>
      jsButton.addEventListener("click", () => removeTodo(index))
    );
}
