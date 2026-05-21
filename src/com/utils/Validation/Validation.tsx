import * as yup from 'yup';

export const LoginValidationSchema=yup.object({
  username: yup.string().required('Username is required').trim(),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required').trim(),

})

export const RegisterValidation=yup.object({
  Name:yup.string().required('Username is required').trim(),
  Password:yup.string().min(6, 'Password must be at least 6 characters').required('Password is required').trim(),
  Age:yup
    .string()
    .required('Age is required')
    .test('minimum-age', 'Age must be at least 18 or above', value => {
      const age = Number(value);
      return Number.isFinite(age) && age >= 18;
    }),
})
