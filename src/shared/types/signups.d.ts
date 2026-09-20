type SignupType = 'Non-intervention' | 'Intervention' | 'Tutoring' | 'Assessment' | 'Staff reservation' | 'Alt setting';

type Signup = {
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
  room: '1' | '2' | null,
  comments: string,
  rowId: string,
  studyIn1: string,
  mediaIn: string,
  mediaOut: string,
  studyIn2: string ,
}

type RawSignup = Omit<Signup, 'date' | 'timestamp'> & { 
  date: string, 
  timestamp: Date
}


