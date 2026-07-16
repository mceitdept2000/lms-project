import { UserManager } from "~/app/_components/user-manager";

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-primary text-xl font-bold">Users</h1>
      <UserManager />
    </div>
  );
}
