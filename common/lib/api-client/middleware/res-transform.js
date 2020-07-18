module.exports = {
  name: 'response-transform',
  res: function(payload) {
    console.log(payload)
    return payload
  },
}
