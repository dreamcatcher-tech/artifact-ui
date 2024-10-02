export const tryParse = (value: string) => {
  if (value === '') {
    return ''
  }

  try {
    return JSON.parse(value)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return value === undefined ? null : value
    }
  }
}
