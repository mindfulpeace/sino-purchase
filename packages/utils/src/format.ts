export const amountToWord = (amount: number): string => {
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟'];
  const bigUnits = ['', '万', '亿'];

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const yuan = Math.floor(absAmount);
  const fen = Math.round((absAmount - yuan) * 100);

  let result = '';

  if (yuan === 0) {
    result += '零';
  } else {
    const str = yuan.toString();
    const len = str.length;

    for (let i = 0; i < len; i++) {
      const digit = parseInt(str[i]);
      const unitIndex = (len - i - 1) % 4;
      const bigUnitIndex = Math.floor((len - i - 1) / 4);

      if (digit !== 0) {
        result += digits[digit] + units[unitIndex];
      } else if (i > 0 && parseInt(str[i - 1]) !== 0) {
        result += '零';
      }

      if (unitIndex === 0 && bigUnitIndex > 0) {
        result += bigUnits[bigUnitIndex];
      }
    }
  }

  result += '元';

  if (fen > 0) {
    const jiao = Math.floor(fen / 10);
    const fenPart = fen % 10;

    if (jiao > 0) {
      result += digits[jiao] + '角';
    }

    if (fenPart > 0) {
      result += digits[fenPart] + '分';
    }
  } else {
    result += '整';
  }

  if (isNegative) {
    result = '负' + result;
  }

  return result;
};
