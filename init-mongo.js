db = db.getSiblingDB("ecoride");

db.createUser({
  user: "ecoride_app",
  pwd: "password",
  roles: [
    {
      role: "readWrite",
      db: "ecoride",
    },
  ],
});
