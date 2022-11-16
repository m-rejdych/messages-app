import {
  useState,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react';

const useDebounce = <T>(
  value: T,
  ms: number,
): [T, Dispatch<SetStateAction<T>>] => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const timeout = setTimeout(() => {
      setDebouncedValue(value);
      timeoutRef.current = null;
    }, ms);

    timeoutRef.current = timeout;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value]);

  return [debouncedValue, setDebouncedValue];
};

export default useDebounce;
