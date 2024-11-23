function generateRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function decimalToBinar(val) {
  let res = ""
  for (let i = val; i != 0; i /= 2) {
    i = Math.floor(i);
    if (i == 0) {
      break;
    }
    res += i % 2;
  }
  res = res.split("").reverse().join("");
  return res;
}
function binarToDecimal(str) {
  let res = 0;
  for (let i = 0, j = str.length - 1; j >= 0; ++i, --j) {
    if (str[j] == "1") {
      res += 2**i;
    }
  }
  return res;
}

function encodeIEEE754_64(number) {
  if (typeof number != "number") {
    throw new Error("The argument type must be a number.")
  }

  let res = {};
  if (number == Infinity) {
    res.sign = "0";
    res.exponent = "11111111111";
    res.fraction = "";
    for (let i = 0; i < 52; ++i) {
      res.fraction += "0"
    }
    res.ieee754 = "";
    res.ieee754 += res.sign + res.exponent + res.fraction;
  } else if (number == -Infinity) {
    res.sign = "1";
    res.exponent = "11111111111";
    res.fraction = "";
    for (let i = 0; i < 52; ++i) {
      res.fraction += "0"
    }
    res.ieee754 = "";
    res.ieee754 += res.sign + res.exponent + res.fraction;
  } else if (Number.isNaN(number)) {
    res.sign = generateRandomInteger(0, 1);
    res.exponent = "11111111111";
    res.fraction = "";
    for (let i = 0; i < 52; ++i) {
      res.fraction += generateRandomInteger(0, 1);
    }
    res.ieee754 = "";
    res.ieee754 += res.sign + res.exponent + res.fraction;
  } else if (number == 0) {
    if (1 / number == -Infinity) {
      res.sign = "1";
    } else {
      res.sign = "0";
    }
    res.exponent = "00000000000";
    res.fraction = ""
    for (let i = 0; i < 52; ++i) {
      res.fraction += '0';
    }
    res.ieee754 = "";
    res.ieee754 += res.sign + res.exponent + res.fraction;
  } else {

    const BIAS = 1023;
    let flag = 0;
    if (Math.trunc(number) != 0) {
      flag = 1;
    }
    
    
    if (number < 0) {
      res.sign = "1";        
      number *= -1;
    } else {
      res.sign = "0"
    }

    
      let mantisa = "";
      let fractionalPart = number;
      if (flag) {
        let wholepart = Math.floor(number);      
        fractionalPart = number - wholepart;
        let binaryWholePart = decimalToBinar(wholepart)
        mantisa += binaryWholePart + ".";
      }
            
      for (let i = 0; i < 52 && fractionalPart != 1; ++i) {
        fractionalPart = fractionalPart * 2
        if (fractionalPart == 1) {          
          mantisa += 1;
        } else if (fractionalPart > 1) {
          mantisa += 1;
          fractionalPart = fractionalPart - 1;
        }  else {
          mantisa += 0;
          
        }
        
      }
      
      
      let exp = 0;
      if (flag) {
        let indexofPoint = mantisa.indexOf(".");
        exp = indexofPoint - 1;
      } else {
        for (let i = 0; i < mantisa.length; ++i) {
          if (mantisa[i] == "1") {
            --exp;
            break; 
          }
          --exp;
        }        
      }
      
      
      
      let exponent = decimalToBinar(exp + BIAS);
      
      res.exponent = "";
      for (let i = 0; i < 11 - exponent.length; ++i) {
        res.exponent += 0;
      }
      res.exponent += exponent;
      res.fraction = "";
      if (flag) {
        mantisa = mantisa.split(".").join("");
        for (let i = 0, j = 1; i < 52; ++i, ++j) {
          if (j < mantisa.length) {
            res.fraction += mantisa[j];
          } else {
            res.fraction += 0;
          }
        }
      } else {
        for (let i = 0, j = exp * -1; i < 52; ++i, ++j) {
          if (j < mantisa.length) {
            res.fraction += mantisa[j];
          } else {
            res.fraction += 0;
          }
        }
      }
      res.ieee754 = "";
      res.ieee754 += res.sign + res.exponent + res.fraction ;
        
    }  

  return res;
}

function decodeIEEE754_64(str) {
  if (typeof str != "string") {
    throw new Error("The argument type must be a string.")
  }
  const BIAS = 1023;
  let sign = 0;
  if (str[0] == "0") {
    sign = 1;
  } else {
    sign = -1;
  }
  let countof1 = 0;
  let isAll0InFruction = true;
  let exponent = "";
  let fraction = "";
  let exp = 0;
  let isDenormalized = false;
  for (let i = 1; i < str.length; ++i) {
    if (i < 12) {
      if (str[i] == "1") {
        ++countof1;
      }
      exponent += str[i];
    }
    if (i >= 12) {
      if (str[i] != "0") {
        isAll0InFruction = false;
      }
      fraction += str[i];
    }
  }

  if (countof1 == 11 && isAll0InFruction) {
    if (sign == -1) {
      return -Infinity
    } else {
      return Infinity;
    }
  }

  if (countof1 == 11 && !isAll0InFruction) {
    return NaN;
  }

  if (!countof1 && isAll0InFruction) {
    if (sign == -1) {
      return -0;
    } else {
      return 0;
    }
  }

  if (countof1 == 0) {
    isDenormalized = true;
    
  }

  let wholepart = "";
  wholepart += "1";
  let fractionalPart = 0;
  if (isDenormalized) {
    exp = 1 - BIAS;
  } else {
    exp = binarToDecimal(exponent) - BIAS;
  }

  if (exp >= 0) {
    
    for (let i = 0; i < exp; ++i) {
      wholepart += fraction[i];
    }
    
    wholepart = binarToDecimal(wholepart);
    for (let i = exp, j = 1; i < fraction.length; ++i, ++j) {
      if (fraction[i] == '1') {
        fractionalPart += 1 / 2 ** j
      }
    }
  
    return sign * (fractionalPart + wholepart);
  } else {   
    let mantisa  = ""; 
    for (let i = 0; i != exp; --i) {
      if (i == 0 && !isDenormalized) {
        mantisa += "1";
      } else {
        mantisa += "0";
      }
    }
    mantisa += fraction;

    
    for (let i = 0, j = 1; i < mantisa.length; ++i, ++j) {
      if (mantisa[i] == "1") {
        fractionalPart += 1 / 2 ** j;
      }
      
    }

    return sign * fractionalPart;
  }


  
}

console.log(encodeIEEE754_64(12345.12345));
console.log(decodeIEEE754_64('0100000011001000000111001000111111001101001101011010100001011000'));



