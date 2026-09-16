export interface InterventionTeachers {
  s1: TeachersByDay,
  s2: TeachersByDay,
  s2Date: Date,

}
export interface StudyTeachers {
  s1: TeachersByDay,
  s2: TeachersByDay,
  s2Date: Date,
}

interface TeachersByDay {
    'Day 1': string[],
    'Day 2': string[],
    'Day 3': string[],
    'Day 4': string[],
    'Day 5': string[],
    'Day 6': string[],
    'Day 7': string[],
    'Day 8': string[],
}