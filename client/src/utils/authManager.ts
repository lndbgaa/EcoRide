let logoutFn: (() => void) | null = null;

export const setLogoutFn = (fn: () => void) => {
  logoutFn = fn;
};

export const triggerLogout = () => {
  if (logoutFn) logoutFn();
};
