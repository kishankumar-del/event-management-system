const crypto = require('crypto');

/**
 * Generates an unambiguous, human-readable registration code.
 * Excludes easily confusable characters (0, O, 1, I).
 * Example output: REG-8F7K2M
 */
const generateRegistrationCode = (prefix = 'REG') => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const length = 6;
  const bytes = crypto.randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `${prefix}-${code}`;
};

/**
 * Generates a payment reference code.
 * Example output: PAY-8274-9182
 */
const generatePaymentReference = () => {
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  return `PAY-${part1}-${part2}`;
};

module.exports = {
  generateRegistrationCode,
  generatePaymentReference,
};

