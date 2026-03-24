import { type FC, type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNotificationsReducer } from "../../atoms/notification";

import { resetGraphQLLink } from "../../graphql";
import { logIn, register } from "../../apis/auth";
import { useAuthReducer } from "../../atoms/auth";
import { validateEmail } from "../../utils/validators";

interface EmailPasswordFormProps {
  create?: boolean;
}

const EmailPasswordForm: FC<EmailPasswordFormProps> = ({ create = false }) => {
  const { t } = useTranslation();
  const { login } = useAuthReducer();
  const { addNotification } = useNotificationsReducer();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const validEmail = () => email === "" || validateEmail(email);
  const validPassword = () => (email === "" && password === "") || password.length >= 8;
  const validPassword2 = () =>
    !create || (password === "" && password2 === "") || password2 === password;

  const getInputClassName = (value: string, isValid: () => boolean | RegExpMatchArray | null) =>
    value.length > 0
      ? isValid()
        ? "border-green-500/50 focus-visible:border-green-500"
        : "border-destructive focus-visible:border-destructive"
      : "";

  const isDisabled = !validEmail() || !validPassword() || !validPassword2();

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!(email.length > 0) || !(password.length > 0)) {
      throw new Error("Email or password was not provided");
    }
    try {
      let response;
      if (create) {
        response = await register({ username: email, password: password });
      } else {
        response = await logIn({ username: email, password: password });
      }
      login(response.data);
      resetGraphQLLink();
    } catch (error: unknown) {
      addNotification({
        title: t("Error"),
        body: error instanceof Error ? error.message : String(error),
        type: "error",
      });
    }
  };

  return (
    <form className="w-full max-w-sm space-y-5" onSubmit={submitForm}>
      <h2 className="text-2xl font-bold tracking-tight">
        {create ? t("Create Account") : t("Login")}
      </h2>

      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium uppercase tracking-wider opacity-40">
          {t("Email")}
        </Label>
        <Input
          type="email"
          placeholder={t("Email Placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(getInputClassName(email, validEmail))}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium uppercase tracking-wider opacity-40">
          {t("Password")}
        </Label>
        <Input
          type="password"
          placeholder={t("Password Placeholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={cn(getInputClassName(password, validPassword))}
        />
      </div>

      {create && (
        <div className="space-y-1.5">
          <Label className="text-[11px] font-medium uppercase tracking-wider opacity-40">
            {t("Confirm Password")}
          </Label>
          <Input
            type="password"
            placeholder={t("Confirm Password Placeholder")}
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className={cn(getInputClassName(password2, validPassword2))}
          />
        </div>
      )}

      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isDisabled}>
          {create ? t("Create Account") : t("Login")}
        </Button>
      </div>

      <p className="text-center text-xs opacity-40">
        {create ? (
          <Link to="/login" className="underline underline-offset-4 transition-opacity hover:opacity-70">
            {t("Login")}
          </Link>
        ) : (
          <Link to="/create-account" className="underline underline-offset-4 transition-opacity hover:opacity-70">
            {t("Create Account")}
          </Link>
        )}
      </p>
    </form>
  );
};

export default EmailPasswordForm;
