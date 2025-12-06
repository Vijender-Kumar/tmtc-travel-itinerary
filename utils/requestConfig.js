//for Any 3rd Party Post API
const postConfig = (apiUrl, keyValue, payload) => {
  const config_data = {
      url: apiUrl,
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${keyValue}`,
      },
      data: JSON.parse(JSON.stringify(payload))
  }
  return config_data;
}

//for Any 3rd Party Get API
const getConfig = (apiUrl, keyValue) => {
  return {
      url: apiUrl,
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${keyValue}`,
      },
  }
}

module.exports = {
  postConfig,
  getConfig,
}
