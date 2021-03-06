import axios from "axios";
import { Form } from "formik";
import { useState } from "react";
import Select from "react-select";
import styled from "styled-components";

export const PageWrappaer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%;
`;

export const FormWrapper = styled.div`
  display: flex;
  margin: 0 auto;
  align-items: center;
  flex-direction: column;
  max-width: 900px;
`;

export const StyledForm = styled(Form)`
  display: grid;
  grid-template-columns: 1fr;
  grid-row-gap: 2em;
  width: 100%;
`;

const FieldWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const FieldTitle = styled.h4``;

const ErrorText = styled.span`
  color: #f44336;
  margin: 0;
  font-size: 0.75rem;
  margin-top: 3px;
  text-align: left;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
  font-weight: 400;
  line-height: 1.66;
  letter-spacing: 0.03333em;
`;

const FieldInput = styled.input`
  height: 2em;
`;

export const TableSelect = styled(Select)``;

export const FormSelect: React.FC<any> = ({
  title,
  name,
  options,
  onChange,
  error,
}) => {
  return (
    <FieldWrapper>
      <FieldTitle>{title}</FieldTitle>
      <Select
        options={formatter(options)}
        onChange={(e) => onChange(e, name)}
      />
      <ErrorText>{error}</ErrorText>
    </FieldWrapper>
  );
};

export const FormTextField: React.FC<any> = ({
  title,
  errorText,
  ...props
}) => {
  return (
    <FieldWrapper>
      <FieldTitle>{title}</FieldTitle>
      <FieldInput type="text" {...props} />
      <ErrorText>{errorText}</ErrorText>
    </FieldWrapper>
  );
};

export const formatter = (list) => {
  return list.map((item) => {
    return { value: item, label: item };
  });
};

export const formatterColored = (list) => {
  return list.map((item) => {
    return { value: item, label: item, color: getStatusColor(item) };
  });
};

export const getStatusColor = (status) => {
  switch (status) {
    case "Not Accepted":
      return "#D7E2EA";
    case "Completed":
      return "#abd67d";
    case "In-Progress":
      return "#50B4D8";
    case "Problem":
      return "#c83349";
  }
};

export const Expanded = styled.div`
  p {
    margin: 0;
  }
`;

export const Clickable = styled.a`
  cursor: link;
`;

export const Tooltip = styled.p`
  visibility: hidden;
  width: 120px;
  background-color: black;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;

  /* Position the tooltip */
  position: absolute;
  z-index: 1;
  top: -5px;
  left: 105%;
`;

export const Remarks: React.FC<any> = ({ id, content }) => {
  const [input, setInput] = useState(false);
  const [value, setValue] = useState(content);
  const handleType = ({ target: { value } }) => {
    setValue(value);
  };
  const handleSubmit = async () => {
    await axios.put("/api/request/change", { id, value, type: "remarks" });
    setInput(false);
  };
  return input ? (
    <FieldWrapper>
      <FieldInput value={value} onChange={handleType} />
      <button onClick={handleSubmit}>submit</button>
    </FieldWrapper>
  ) : (
    <FieldWrapper>
      <a onClick={() => setInput(true)}>Remarks: {value}</a>
    </FieldWrapper>
  );
};
