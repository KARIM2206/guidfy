'use strict';

const createRegisterDto = (body) => ({
  email:           body.email,
  name:            body.name,
  password:        body.password,
  confirmPassword: body.confirmPassword,
});

const createUpdateProfileDto = (body) => ({
  name:     body.name,
  email:    body.email,
  password: body.password,
});

const createChangeUserRoleDto = (body) => ({
  role:  body.role,
  email: body.email,
});

const createGetAllUsersDto = (query) => ({
  role:  query.role,
  page:  query.page,
  limit: query.limit,
});

const createAddUserDto = (body) => ({
  email:    body.email,
  name:     body.name,
  role:     body.role,
  password: body.password,
});

const createDeleteUserDto = (body) => ({
  email: body.email,
});

module.exports = {
  createRegisterDto,
  createUpdateProfileDto,
  createChangeUserRoleDto,
  createGetAllUsersDto,
  createAddUserDto,
  createDeleteUserDto,
};

