const BITS_PER_NUMBER = 9 // 9 бит хватит для чисел до 300

// Упаковка чисел в битовый поток
function serialize(numbers) {
  const bitStream = []
  let currentByte = 0
  let bitsUsed = 0

  for (const num of numbers) {
    for (let i = 0; i < BITS_PER_NUMBER; i++) {
      const bit = (num >> i) & 1 // Получаем i-ый бит числа
      currentByte |= bit << bitsUsed
      bitsUsed++

      if (bitsUsed === 8) {
        bitStream.push(currentByte)
        currentByte = 0
        bitsUsed = 0
      }
    }
  }

  // Добавляем остаточные биты
  if (bitsUsed > 0) {
    bitStream.push(currentByte)
  }

  // Преобразуем байты в ASCII строку, затем в Base64
  let binaryString = ''
  for (const byte of bitStream) {
    binaryString += String.fromCharCode(byte)
  }

  return btoa(binaryString)
}

// Распаковка строки обратно в массив
function deserialize(string) {
  const binaryString = atob(string)
  const bits = []

  // Преобразуем каждый байт в отдельные биты
  for (let i = 0; i < binaryString.length; i++) {
    const byte = binaryString.charCodeAt(i)

    for (let j = 0; j < 8; j++) {
      bits.push((byte >> j) & 1)
    }
  }

  const result = []

  // Собираем числа по BITS_PER_NUMBER битов
  for (let i = 0; i < bits.length; i += BITS_PER_NUMBER) {
    let num = 0

    for (let j = 0; j < BITS_PER_NUMBER; j++) {
      if (i + j >= bits.length) break
      num |= bits[i + j] << j
    }

    // Исключаем ложные нули
    if (num !== 0 || i + BITS_PER_NUMBER <= bits.length) {
      result.push(num)
    }
  }

  return result
}

// Дополнительно - проверка правильности восстановления
function arraysEqual(a, b) {
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

// Запуск тестов
function runTest(testName, numbers) {
  const original = numbers.join(',')
  const serialized = serialize(numbers)
  const deserialized = deserialize(serialized)

  const originalSize = original.length
  const compressedSize = serialized.length
  const ratio = (1 - compressedSize / originalSize) * 100

  console.log(`Тест: ${testName}`)
  console.log(
    `Исходная строка: "${original.slice(0, 50)}${
      original.length > 50 ? '...' : ''
    }"`
  )
  console.log(
    `Сжатая строка: "${serialized.slice(0, 50)}${
      serialized.length > 50 ? '...' : ''
    }"`
  )
  console.log(`Коэффицент сжатия: ${ratio.toFixed(2)}%`)
  console.log(
    `Восстановлено верно: ${arraysEqual(numbers, deserialized) ? 'Да' : 'Нет'}`
  )
  console.log('---')
}

// Примеры запуска тестов:
runTest('Все однозначные', Array(1000).fill(1))
runTest('Все двузначные', Array(1000).fill(99))
runTest('Все трехзначные', Array(1000).fill(100))
runTest(
  'Каждого числа по 3',
  Array.from({ length: 300 }, (_, i) => i + 1).flatMap((n) => [n, n, n])
)
runTest(
  'Случайные 50 чисел',
  Array.from({ length: 50 }, () => Math.floor(Math.random() * 300) + 1)
)
runTest(
  'Случайные 100 чисел',
  Array.from({ length: 100 }, () => Math.floor(Math.random() * 300) + 1)
)
runTest(
  'Случайные 500 чисел',
  Array.from({ length: 500 }, () => Math.floor(Math.random() * 300) + 1)
)
runTest(
  'Случайные 1000 чисел',
  Array.from({ length: 1000 }, () => Math.floor(Math.random() * 300) + 1)
)
