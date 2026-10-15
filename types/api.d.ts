interface APIRESPONSE<T = any> {
  data: T;
  message: string;
}

interface APIRESPONSEV2<T = any> {
  data: {
    data: T;
    message: string;
  };
  meta: Record<string, any>;
}
