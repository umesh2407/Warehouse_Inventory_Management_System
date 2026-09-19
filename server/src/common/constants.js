const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  WAREHOUSE_STAFF: 'WAREHOUSE_STAFF',
});

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const AUTH_COOKIE_NAME = 'warehouse_token';

module.exports = {
  ROLES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  AUTH_COOKIE_NAME,
};
