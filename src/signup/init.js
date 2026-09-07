import {
  setValue, setVisible, valueOf,
} from "./dom.js";

import {
  state
} from "./state.js";

import {
  checkStaffStatus, checkAdminStatus,
} from "./ui.js"; 

export  const getInitialData = async (successCallback, errorCallback) => {
  const url = window.location.href;
  if ((url.indexOf("localhost") >=0 ) || (url.indexOf("127.0.0.1") >= 0)) {
    try {
      await setMockData(successCallback);
    } catch (error) {
      console.error(error);
      errorCallback(error);
    }
  } else {
    google.script.run
    .withFailureHandler(errorCallback)
    .withSuccessHandler(successCallback)
    .getInitialSignupFormData();
  }
};


async function setMockData(callback) {
  setValue("#email", "wpsdeveloper@walpole.k12.ma.us");
  setValue("#update-row-id", "");
  state.isStaff = true;
  state.isEditor = true;
  state.isAdmin = true;
  checkStaffStatus(state);
  checkAdminStatus(state);

  const sampleData = await import("../../sampledata.js");
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  await delay(2000); 
  
  callback(sampleData.default);
}


