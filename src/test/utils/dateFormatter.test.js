const { addPadding, today } = require('../../utils/dateFormatter')

test('turns the string "8" to the string "08"', () => {
  expect(addPadding('8')).toBe('08')
})

test('does not add padding to "12"', () => {
  expect(addPadding('12')).toBe('12')
})

test('returns a String 10 characters long', () => {
  expect(today().length).toBe(10)
})
