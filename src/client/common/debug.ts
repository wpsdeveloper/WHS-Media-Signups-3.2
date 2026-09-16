const url: string = window.location.href;
export const DEBUG: boolean = (url.indexOf('localhost') >= 0 || url.indexOf('127.0.0.1') >= 0);
