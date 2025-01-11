from operator import attrgetter, itemgetter
import random
from math import log2
from collections import Counter


class Mask(int):
    def __new__(cls, size=None, val=None):
        if size is not None:
            return super().__new__(cls, (1 << size) - 1)
        return super().__new__(cls, val)

    def at(self, index):
        return bool(self & (1 << index))

    def min_true_index(self):
        if not self:
            return -1
        return int(log2(self & -self))

    def switch(self, indices, value):
        res = self
        for idx in indices:
            if value:
                res |= 1 << idx
            else:
                res &= ~(1 << idx)
        return Mask(val=res)

    def apply(self, data, getter=None):
        items = enumerate(data) if not getter else zip(map(getter, data), data)
        return map(itemgetter(1), filter(lambda item: self.at(item[0]), items))


class Student:
    max_occurance = 1

    def __init__(self, name, settings):
        self.name = name
        self.requests = settings["requests"]
        self.exclude = settings["exclude"]
        self.prefs = {}
        self.partners = [None] * 12

    def load_prefs(self, students):
        for student in students:
            if (
                student is self
                or student.name in self.exclude
                or self.name in student.exclude
            ):
                continue

            if student.name in self.requests and self.name in student.requests:
                self.prefs[student] = 3
            elif student.name in self.requests:
                self.prefs[student] = 1.75
            elif self.name in student.requests:
                self.prefs[student] = 1
            else:
                self.prefs[student] = 0.4

    def is_valid_partner(self, other):
        counts = Counter(filter(bool, self.partners))
        if not counts:
            return True
        return (
            max(counts.values()) < self.max_occurance
            or other.name not in self.partners
        )

    def pair(self, other, day):
        if not self.is_valid_partner(other):
            return
        self.partners[day] = other.name
        other.partners[day] = self.name

        if not self.is_valid_partner(other):
            del self.prefs[other]
            del other.prefs[self]
            return
        self.prefs[other] *= 0.1
        other.prefs[self] *= 0.1

    def choose_random(self, mask):
        available, weights = [[], []]
        for student in mask.apply(self.prefs, attrgetter("id")):
            if not self.is_valid_partner(student):
                continue
            available.append(student)
            weights.append(self.prefs[student])

        if not available:
            return

        return random.choices(available, weights)[0]
