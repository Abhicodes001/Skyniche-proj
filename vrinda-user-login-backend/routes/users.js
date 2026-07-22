const { createUser, fetchAllUsers, deleteUser, getUserById, updateUser } = require("../controllers/users");

const userRoutes = [
  {
    method: "POST",
    url: "/webservices/users/add-users",
    handler: createUser,
  },
  {
    method: "POST",
    url: "/webservices/users/update-user",
    handler: updateUser,
  },
  {
    method: "POST",
    url: "/webservices/users/delete-user",
    handler: deleteUser,
  },
  {
    method: "POST",
    url: "/webservices/users/get-user-by-id",
    handler: getUserById,
  },
  {
    method: "POST",
    url: "/webservices/users/get-all-users",
    handler: fetchAllUsers,
  },
  {
    method: "GET",
    url: "/webservices/users/get-all-users",
    handler: fetchAllUsers,
  },
  {
    method: "GET",
    url: "/admin/users",
    handler: fetchAllUsers,
  }
];

module.exports = userRoutes;