import React from "react";

function Add(props) {
  const { addQuestion } = props;
  return <button onClick={addQuestion}>Add Button</button>;
}

export default Add;
