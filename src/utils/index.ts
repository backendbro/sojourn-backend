export function numberOfNights(from: Date, to: Date) {
  const timeDiff = new Date(to).getTime() - new Date(from).getTime();
  const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return numberOfNights;
}

export function generateShortCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
