export const validateEmail = (email: string) => {
  return /^\w+(-?\w+)*@\w+(-?\w+)*(\.\w{2,3})+$/.test(email)
}
