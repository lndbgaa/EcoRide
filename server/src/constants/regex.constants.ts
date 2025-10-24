export const REGEX = {
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])\S+$/,
  firstName: /^[a-zA-ZÀ-ÖØ-öø-ÿ][a-zA-ZÀ-ÖØ-öø-ÿ\s'’-]*$/,
  lastName: /^[a-zA-ZÀ-ÖØ-öø-ÿ][a-zA-ZÀ-ÖØ-öø-ÿ\s'’-]*$/,
  phoneFR: /^(0|\+33|0033)[\s-]?[1-9]([\s-]?\d{2}){4}$/,
  licensePlate: /^[A-Z]{2}-\d{3}-[A-Z]{2}$/i,
};
