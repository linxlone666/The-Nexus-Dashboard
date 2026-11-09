type User = {
  email: string;
  password: string;
};
const users: User[] = [
  {
    email: "admin@company.com",
    password: "pass",
  },
  {
    email: "user@company.com",
    password: "pass",
  },
  {
    email: "manager@company.com",
    password: "pass",
  },
];

export type Credential = {
  token: string;
  email: string;
};

export const login = async (
  email: string,
  password: string,
): Promise<Credential> => {
  const user = users.find((user) => user.email === email);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.password !== password) {
    throw new Error("Password is required");
  }

  return {
    token: crypto.randomUUID(),
    email: user.email,
  };
};
