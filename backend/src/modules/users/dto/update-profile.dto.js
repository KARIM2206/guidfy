'use strict';

const createUpdateProfileDto = (body = {}) => ({
  name: body.name,
  title: body.title,
  bio: body.bio,
  cover: body.cover,
});

const createAssignBadgeDto = (body = {}) => ({
  userId: body.userId,
  badgeId: body.badgeId,
});

const createUserIdParamDto = (params = {}) => ({
  id: params.id,
});

const createGetNotificationsDto = (query = {}) => ({
  page: query.page,
  limit: query.limit,
});

module.exports = {
  createUpdateProfileDto,
  createAssignBadgeDto,
  createUserIdParamDto,
  createGetNotificationsDto,
};
