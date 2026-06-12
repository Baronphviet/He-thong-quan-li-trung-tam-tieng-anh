export const ROLE_HOME = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
  PARENT: "/parent"
};

export function getRoleHome(role) {
  return ROLE_HOME[role] || "/";
}

export function sameId(left, right) {
  if (left == null || right == null) return false;
  return String(left) === String(right);
}
