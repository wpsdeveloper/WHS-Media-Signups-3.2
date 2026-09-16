export interface Signup {
  timestamp: Date,
  email: string,
  emailStudent: string,
  lastname: string,
  firstname: string,
  date: Date,
  period: string,
  type: SignupType,
  teacherStudy: string,
  subject: string,
  purpose: string,
  teacherAcad: string,
  room: string,
  comments: string,
  rowId: string,
  studyIn1: string,
  mediaIn: string,
  mediaOut: string,
  studyIn2: string ,
}

export type SignupType = 'Non-intervention' | 'Intervention' | 'Tutoring' | 'Assessment' | 'Staff reservation' | 'Alt setting';

