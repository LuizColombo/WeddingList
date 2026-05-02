function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function sanitize(s: string, max: number): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max);
}

export interface PixParams {
  key: string;
  receiverName: string;
  receiverCity: string;
  amountCents?: number;
  txid?: string;
}

export function buildPixCode(params: PixParams): string {
  const {
    key,
    receiverName,
    receiverCity,
    amountCents,
    txid = "***",
  } = params;

  const merchantAccount =
    tlv("00", "br.gov.bcb.pix") + tlv("01", key.trim());

  const additionalData = tlv("05", sanitize(txid, 25) || "***");

  const amountStr =
    amountCents && amountCents > 0
      ? (amountCents / 100).toFixed(2)
      : undefined;

  const fields = [
    tlv("00", "01"),
    tlv("01", "11"),
    tlv("26", merchantAccount),
    tlv("52", "0000"),
    tlv("53", "986"),
    amountStr ? tlv("54", amountStr) : "",
    tlv("58", "BR"),
    tlv("59", sanitize(receiverName, 25) || "RECEBEDOR"),
    tlv("60", sanitize(receiverCity, 15) || "BRASIL"),
    tlv("62", additionalData),
  ].join("");

  const toHash = fields + "6304";
  return toHash + crc16(toHash);
}

export function pixFromEnv(amountCents?: number, txid?: string): string {
  return buildPixCode({
    key: process.env.PIX_KEY || "",
    receiverName: process.env.PIX_RECEIVER_NAME || "RECEBEDOR",
    receiverCity: process.env.PIX_RECEIVER_CITY || "BRASIL",
    amountCents,
    txid,
  });
}
