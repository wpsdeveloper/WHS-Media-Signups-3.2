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


