export const ROOT_SAGA_ERROR = "ROOT_SAGA_ERROR";

export const rootSagaError = error => ({
  type: ROOT_SAGA_ERROR,
  error
});
