export function toDateTimeLocal(value) {
  const date = value ? new Date(value) : new Date(Date.now() + 60 * 60 * 1000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function toIso(value) {
  return new Date(value).toISOString();
}

export function can(user, permission) {
  return Boolean(user?.permissions?.includes(permission));
}
