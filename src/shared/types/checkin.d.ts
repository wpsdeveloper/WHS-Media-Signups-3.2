/**
 * Represents the type of check-in, derived from the keys of CHECKIN_CONFIG.
 */
type CheckinType = keyof typeof CHECKIN_CONFIG;

/**
 * Represents the property name keys associated with a specific check-in type.
 */
type CheckinKeys = typeof CHECKIN_CONFIG[CheckinType]['propName'];

/**
 * Represents the current state of a check-in box in the user interface.
 */
type CheckinBoxState = "ready" | "loading" | "editing" | "hasData";