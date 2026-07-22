/* =========================================================
   HOUSE RENT PORTAL - AUTH / SESSION LAYER
   Session is kept in localStorage as "currentUser".
   ========================================================= */

function doLogin(role, username, password) {
  const user = findUser(username, password, role);
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  }
  return null;
}

function getCurrentUser() {
  const u = localStorage.getItem("currentUser");
  return u ? JSON.parse(u) : null;
}

function logout(redirectPath) {
  localStorage.removeItem("currentUser");
  window.location.href = redirectPath || "index.html";
}

/* Call at the top of every protected page.
   role: "owner" | "tenant"
   redirectPath: relative path back to the login page from that page's folder */
function guardRole(role, redirectPath) {
  const u = getCurrentUser();
  if (!u || u.role !== role) {
    window.location.href = redirectPath;
  }
  return u;
}
