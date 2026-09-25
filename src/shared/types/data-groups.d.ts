type SignupServerData = {
  students: Student[],
  signups: Signup[],
  dailySchedules: DailyBlock[],
  appSettings: AppSetting[],
}

type AttendanceServerData = {
  dailySchedules: DailyBlock[],
  signups: Signup[],
  appSettings: AppSetting[],
}

type AdminData = {
  dailySchedules: DailyBlock[],
  students: Student[],
  appSettings: AppSetting[],
}

type SSRow = string[]; 

type AppConfig = {
  view: 'signup' | 'attendance' | 'admin',
  wedInt: boolean,
  s2Date: string,
  isEditor: boolean,
  isAdmin: boolean,
  isStaff: boolean,
  email: string,
  scriptUrl: string,
}