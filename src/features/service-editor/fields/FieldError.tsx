import { get } from "../../../utils/object";
import useMaybeT from "../../../hooks/useMaybeT";
import type { FieldErrors } from "react-hook-form";

interface FieldErrorProps {
  errors: FieldErrors;
  name: string;
}

const FieldError = ({ errors, name }: FieldErrorProps) => {
  const err = get(errors, name) as { message?: string } | undefined;
  const maybeT = useMaybeT();
  if (!err) return null;
  return <p className="mt-1 text-sm text-destructive">{maybeT(err.message)}</p>;
};

export default FieldError;
