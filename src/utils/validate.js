// utils/validate.js
/**
 * 邮箱验证
 */
export function validEmail(email) {
  const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
  return reg.test(email)
}

/**
 * 手机号验证（中国）
 */
export function validMobile(mobile) {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(mobile)
}

/**
 * 密码验证（至少8位，包含字母和数字）
 */
export function validPassword(password) {
  const reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  return reg.test(password)
}

/**
 * 验证码验证（4-6位数字）
 */
export function validCaptcha(captcha) {
  const reg = /^\d{4,6}$/
  return reg.test(captcha)
}

/**
 * 身份证号码验证
 */
export function validIdCard(idCard) {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(idCard)
}

/**
 * 用户名验证（字母开头，允许5-16字节，允许字母数字下划线）
 */
export function validUsername(username) {
  const reg = /^[a-zA-Z][a-zA-Z0-9_]{4,15}$/
  return reg.test(username)
}