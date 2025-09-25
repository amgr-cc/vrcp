
export function omitObject <T extends object> (obj: T, ...keys: Array<keyof T>): Partial<T> {
  const newObj: Partial<T> = {};
  const ks: Array<keyof T> = Object.keys(obj) as Array<keyof T>;
  ks.forEach((key: keyof T) => {
    if (!keys.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};


export const extractErrMsg = (error: any): string => {
  return error.response?.data?.error?.message || "Unknown error";
};
