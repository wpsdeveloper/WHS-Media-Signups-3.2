export function getInitialData(onSuccess, onFailure) {
  google.script.run
    .withFailureHandler(onFailure)
    .withSuccessHandler(onSuccess)
    .getInitialSignupFormData();
}

export function getDailySchedules(onSuccess, onFailure) {
  google.script.run
    .withSuccessHandler(onSuccess)
    .withFailureHandler(onFailure)
    .getDailySchedules();
}

export function getInterventionTeachers(onSuccess, onFailure) {
  google.script.run
    .withSuccessHandler(onSuccess)
    .withFailureHandler(onFailure)
    .getInterventionTeachers();
}

export function getNoFlyList(onSuccess, onFailure) {
  google.script.run
    .withSuccessHandler(onSuccess)
    .withFailureHandler(onFailure)
    .getNoFlyList();
}

export function getMaxSignups(onSuccess, onFailure) {
  google.script.run
    .withSuccessHandler(onSuccess)
    .withFailureHandler(onFailure)
    .getDefaultMaxSignups();
}

export function getSignups(onSuccess, onFailure) {
  google.script.run
    .withSuccessHandler(onSuccess)
    .withFailureHandler(onFailure)
    .getSignups();
}

export function getStudents(onSuccess, onFailure) {
  google.script.run
    .withSuccessHandler(onSuccess)
    .withFailureHandler(onFailure)
    .getStudentNames();
}

export function getStudyTeachers(onSuccess, onFailure) {
  google.script.run
    .withSuccessHandler(onSuccess)
    .withFailureHandler(onFailure)
    .getStudyTeachers();
}
