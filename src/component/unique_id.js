import React from 'react';

function unique_id(digits, getInt) {
  let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXZ';
  if (getInt !== undefined && getInt) str = '0123456789';
  let uuid = [];
  for (let i = 0; i < (digits === undefined ? 10 : digits); i++) {
    uuid.push(str[Math.floor(Math.random() * str.length)]);
  }
  return getInt !== undefined && getInt
    ? parseInt(uuid.join(''))
    : uuid.join('');
}

export default unique_id;
