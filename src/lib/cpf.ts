export function sanitizeCPF(input: string): string {
  return input.replace(/\D/g, "");
}

export function isValidCPF(input: string): boolean {
  const cpf = sanitizeCPF(input);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcDigit = (slice: string, factor: number): number => {
    let sum = 0;
    for (const ch of slice) {
      sum += parseInt(ch, 10) * factor--;
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const d1 = calcDigit(cpf.slice(0, 9), 10);
  if (d1 !== parseInt(cpf[9], 10)) return false;

  const d2 = calcDigit(cpf.slice(0, 10), 11);
  if (d2 !== parseInt(cpf[10], 10)) return false;

  return true;
}
