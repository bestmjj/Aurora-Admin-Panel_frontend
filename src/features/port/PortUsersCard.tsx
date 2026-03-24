import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DataLoading from "../DataLoading";

const GET_USERS_BY_EMAIL_QUERY = gql`
  query GetUsersByEmail($email: String!, $limit: Int) {
    paginatedUsers(email: $email, limit: $limit) {
      items {
        id
        email
      }
    }
  }
`;
const ADD_PORT_USER_MUTATION = gql`
  mutation AddPortUser($portId: Int!, $userId: Int!) {
    addPortUser(portId: $portId, userId: $userId)
  }
`;

interface UserResult {
  id: number;
  email: string;
}

interface UserSearchSelectProps {
  open: boolean;
  onSelect: (user: UserResult) => void;
}

const UserSearchSelect = ({ open, onSelect }: UserSearchSelectProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: usersData, loading: usersLoading } = useQuery(
    GET_USERS_BY_EMAIL_QUERY,
    {
      variables: {
        email,
        limit: 5,
      },
      fetchPolicy: "network-only",
    },
  );
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setEmail("");
    }
  }, [open]);

  return (
    <>
      <Input
        type="text"
        className="mt-2 w-full"
        placeholder={t("Please enter an email address")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        ref={inputRef}
      />
      {usersLoading ? (
        <DataLoading />
      ) : (
        <div className="mt-2 flex h-30 flex-col overflow-y-auto">
          {usersData?.paginatedUsers.items.map((user: UserResult) => (
            <div
              className="flex w-full flex-row items-center justify-start"
              key={user.id}
            >
              <span className="text-sm">{user.email}</span>
              <div className="flex flex-grow flex-row items-center justify-end">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onSelect(user)}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

interface Port {
  id: number;
  num: number;
  externalNum?: number | null;
  allowedUsers: { user: { id: number; email: string } }[];
  users?: { id: number; email: string }[];
  [key: string]: unknown;
}

interface PortUsersCardProps {
  port: Port;
  setSelected: (payload: { type: string; id: number; port: Port } | null) => void;
}

const PortUsersCard = ({ port, setSelected }: PortUsersCardProps) => {
  const { t } = useTranslation();
  const [add, setAdd] = useState(port.allowedUsers.length === 0);
  const [addPortUser] = useMutation(ADD_PORT_USER_MUTATION);

  const handleUserSelect = (user: UserResult) => {
    addPortUser({
      variables: {
        portId: port.id,
        userId: user.id,
      },
    });
  };

  return (
    <div className="relative flex h-72 w-full flex-col items-center justify-start space-y-2 px-4 py-4">
      <div className="absolute right-2 top-2" onClick={() => setSelected(null)}>
        <Button variant="ghost" size="icon-xs" className="rounded-full">
          <X size={20} />
        </Button>
      </div>
      <div className="flex w-full flex-row items-center justify-start space-x-2">
        <span className="text-base font-semibold">
          {port.externalNum ? port.externalNum : port.num} {t("Users List")}
        </span>
        <Button
          variant="default"
          size="icon-xs"
          className="rounded-full"
          onClick={() => setAdd((prev) => !prev)}
        >
          <Plus size={16} />
        </Button>
      </div>

      <div
        className={cn(
          "flex w-full flex-col items-center justify-center overflow-hidden transition-all",
          add ? "max-h-40" : "max-h-0",
        )}
      >
        <div className="flex w-full flex-col">
          <UserSearchSelect open={add} onSelect={handleUserSelect} />
        </div>
      </div>
      <div className="flex max-h-32 w-full flex-col items-center justify-center overflow-y-auto">
        {port.users &&
          port.users.map((user) => (
            <div
              className="flex w-full flex-row items-center justify-start"
              key={user.id}
            >
              <span className="text-sm">{user.email}</span>
              <div className="flex flex-grow flex-row items-center justify-end">
                <Button
                  variant="destructive"
                  size="icon-xs"
                  className="rounded-full"
                  onClick={() => console.log("remove")}
                >
                  <Minus size={16} />
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PortUsersCard;
