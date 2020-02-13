export const makeRepeatedUnique = (names: string[]): string[] => {
  let counts: { [key: string]: number } = {}

  return names.reduce((acc, name) => {
    let count = counts[name] = (counts[name] || 0) + 1
    let uniq = count > 1 ? `${name}_${count - 1}` : name
    acc.push(uniq)
    return acc
  }, [] as string[])
}
