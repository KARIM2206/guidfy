'use strict';

const createLoginDto = (body) => ({
  email:    body.email,
  password: body.password,
});

module.exports = {
  createLoginDto,
};

