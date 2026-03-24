import { logout } from "./auth";
import i18n from "../../i18n";
import { notify } from "../../atoms/notification";


export const handleError = (dispatch, error) => {
  if (error.response) {
    const response = error.response;
    if (response.status === 500) {
      notify({
        title: i18n.t("Error"),
        body: i18n.t("Internal Server Error!"),
        type: "error"
      });
    } else if (error.name === "AxiosError") {
      notify({ title: error.code, body: error.message, type: "error" });
    } else if (response.status >= 400 && response.status < 500) {
      if (response.status === 401) {
        dispatch(logout())
        notify({
          title: i18n.t("Error"),
          body: i18n.t("auth:login_required"),
          type: "error"
        });
      } else {
        const data = response.data;
        if (typeof data.detail === "string" || data.detail instanceof String) {
          notify({ title: i18n.t("Error"), body: data.detail, type: "error" })
        } else if (Array.isArray(data.detail)) {
          notify({ title: data.detail[0].type, body: data.detail[0].msg, type: "error" });
        } else {
          notify({ title: i18n.t("Error"), body: JSON.stringify(data.detail), type: "error" });
        }
      }
    } else {
      notify({ title: i18n.t("Error"), body: JSON.stringify(response), type: "error" });
    }
  } else {
    notify({ title: i18n.t("Error"), body: error.toString(), type: "error" });
  }
};
