import { useState } from "react";

export default function useForm(initialValues, onSubmit, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;
    setValues((prev) => {
      const nextValues = {
        ...prev,
        [name]: nextValue
      };
      if (touched[name] && validate) {
        const fieldError = validate(name, nextValue, nextValues);
        setErrors((prevErrors) => ({ ...prevErrors, [name]: fieldError }));
      }
      return nextValues;
    });
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (validate) {
      setValues((prev) => {
        const fieldError = validate(name, nextValue, prev);
        setErrors((prevErrors) => ({ ...prevErrors, [name]: fieldError }));
        return prev;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validate) {
      const newErrors = {};
      Object.keys(values).forEach((key) => {
        const error = validate(key, values[key], values);
        if (error) newErrors[key] = error;
      });
      setErrors(newErrors);
      setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

      if (Object.keys(newErrors).length > 0) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  const replaceValues = (nextValues) => {
    setValues(nextValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues: replaceValues,
    setErrors
  };
}
