"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export function useSweetAlert() {
  const showSuccess = (title, text) => {
    return MySwal.fire({
      icon: "success",
      title: title,
      text: text,
      confirmButtonColor: "#000",
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const showError = (title, text) => {
    return MySwal.fire({
      icon: "error",
      title: title,
      text: text,
      confirmButtonColor: "#000",
    });
  };

  const showWarning = (title, text) => {
    return MySwal.fire({
      icon: "warning",
      title: title,
      text: text,
      confirmButtonColor: "#000",
    });
  };

  const showInfo = (title, text) => {
    return MySwal.fire({
      icon: "info",
      title: title,
      text: text,
      confirmButtonColor: "#000",
    });
  };

  const showConfirm = async (title, text, confirmButtonText = "Yes") => {
    const result = await MySwal.fire({
      icon: "question",
      title: title,
      text: text,
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#d33",
      confirmButtonText: confirmButtonText,
    });
    return result.isConfirmed;
  };

  const showLoading = (title = "Loading...") => {
    MySwal.fire({
      title: title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        MySwal.showLoading();
      },
    });
  };

  const hideLoading = () => {
    MySwal.close();
  };

  const showToast = (icon, title) => {
    const Toast = MySwal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = MySwal.stopTimer;
        toast.onmouseleave = MySwal.resumeTimer;
      },
    });

    return Toast.fire({
      icon: icon,
      title: title,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showLoading,
    hideLoading,
    showToast,
  };
}
