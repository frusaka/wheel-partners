from json import load
from functools import cache
from data import Mask, Student


@cache
def optimal_schedule(mask, day):
    if not mask:
        return 1

    student = students[mask.min_true_index()]
    if mask.bit_count() == 1:
        if "None" in student.partners:
            return 0

        student.partners[day] = "None"
        return 1

    other = student.choose_random(mask)
    if not other:
        return 0

    if other.name == student.partners[day - 1]:
        other = student.choose_random(mask.switch([other.id], 0))
        if not other:
            return 0

    pending = mask.switch([student.id], 0)
    while not optimal_schedule(
        mask.switch([student.id, other.id], 0),
        day,
    ):
        if not pending:
            return 0

        student = students[pending.min_true_index()]
        other = student.choose_random(mask)

        if not other:
            return 0

        pending = pending.switch([student.id], 0)

    student.pair(other, day)
    return 1


def rank(students):
    students.sort(key=lambda student: sum(student.prefs.values()))
    for idx in range(len(students)):
        students[idx].id = idx


PERIOD = "test-subjects"
Student.AMOUNT = 12

with open(f"{PERIOD}.json", "r") as file:
    students_data = load(file)
    students = list(students_data)

for idx, name in enumerate(students):
    students[idx] = Student(name, students_data[name])

for student in students:
    student.load_prefs(students)
    if len(student.prefs) < Student.AMOUNT:
        Student.MAX_OCCURANCE = max(
            Student.MAX_OCCURANCE, (Student.AMOUNT - len(student.prefs)) + 1
        )

for day in range(Student.AMOUNT):
    rank(students)
    optimal_schedule(Mask(len(students)), day)

result = ""

for student in students:
    result += f"{student.name}\n\t"
    result += "\n\t".join(
        map(lambda val: f"{val[0]}. {val[1]}", enumerate(student.partners, 1))
    )
    result += "\n\n"

with open(f"output/{PERIOD}-wheel-partners.txt", "w") as file:
    file.write(result)
