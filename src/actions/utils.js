/*
  Utils
 */

export const makeAxiosConfig = (token, type = 'default') => {
  let config = {
    headers: {
      'Authorization': ['Bearer', token].join(' ')
    }
  }
  if (type === 'form')
    config.headers['Content-Type'] = 'multipart/form-data';
  return config
}