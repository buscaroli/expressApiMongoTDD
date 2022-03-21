const today = () => {
  let now = new Date()
  let day = addPadding(now.getDate())
  let month = addPadding((1 + now.getMonth()).toString())
  let year = now.getFullYear()

  let nowString = `${day}-${month}-${year}`
  return nowString
}

const addPadding = (value) => {
  if (value.length === 1) {
    return `0${value}`
  } else {
    return value
  }
}

module.exports = { today, addPadding }
