function formatDate(date: Date): string {
  return date.toISOString().split(".")[0] + "Z";
}

function uniqId(): string {
  return `${Date.now()}${Math.floor(Math.random() * 100)}`;
}

export { formatDate, uniqId };
