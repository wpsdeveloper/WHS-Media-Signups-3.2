type CheckinType = keyof typeof CHECKIN_CONFIG;
type CheckinKeys = typeof CHECKIN_CONFIG[CheckinType]['propName'];
type CheckinBoxState = "ready" | "loading" | "editing" | "hasData";