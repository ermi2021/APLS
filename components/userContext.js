import { createContext } from "react";

const userContext = createContext({
  worker: {},
  setWorker: (worker) => {},
});

export { userContext };
