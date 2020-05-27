import { FINALIZE_GENRE } from "./types";

export const onFinalize = (values) => (dispatch) => {
  const newState = {
    type: FINALIZE_GENRE,
    payload: values,
  };
  dispatch(newState);
};
