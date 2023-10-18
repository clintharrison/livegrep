import * as React from "react";
import { useEffect } from "react";

export const useDebouncedState = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value]);
  return debouncedValue;
};
