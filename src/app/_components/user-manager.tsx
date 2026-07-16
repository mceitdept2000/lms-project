"use client";

import { Plus, Users } from "lucide-react";
import { useState } from "react";

import { DataTable, type DataTableColumn } from "~/app/_components/data-table";
import { Modal } from "~/app/_components/ui/modal";
import { PERMISSION_VALUES, type Permission } from "~/lib/constants";
import { type RouterOutputs, api } from "~/trpc/react";

type UserRow = RouterOutputs["user"]["list"][number];

function togglePermission(list: Permission[], permission: Permission) {
  return list.includes(permission)
    ? list.filter((p) => p !== permission)
    : [...list, permission];
}

function SetPasswordControl({
  onSubmit,
}: {
  onSubmit: (password: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        className="text-primary text-sm underline"
        onClick={() => setOpen(true)}
      >
        Set password
      </button>
    );
  }

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
        setValue("");
        setOpen(false);
      }}
    >
      <input
        type="password"
        className="border-accent rounded-[8px] border px-2 py-1 text-sm"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        minLength={8}
        required
        autoFocus
      />
      <button type="submit" className="text-primary text-sm underline">
        Save
      </button>
    </form>
  );
}

export function UserManager() {
  const utils = api.useUtils();
  const { data: users, isLoading } = api.user.list.useQuery();

  const [createOpen, setCreateOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);

  const createUser = api.user.create.useMutation({
    onSuccess: async () => {
      setUsername("");
      setPassword("");
      setPermissions([]);
      setCreateError(null);
      setCreateOpen(false);
      await utils.user.list.invalidate();
    },
    onError: (err) => setCreateError(err.message),
  });

  const setUserPermissions = api.user.setPermissions.useMutation({
    onSuccess: () => utils.user.list.invalidate(),
  });

  const setPasswordMutation = api.user.setPassword.useMutation();

  const columns: DataTableColumn<UserRow>[] = [
    { header: "Username", cell: (user) => user.username },
    {
      header: "Permissions",
      cell: (user) => (
        <div className="flex flex-wrap gap-3">
          {PERMISSION_VALUES.map((permission) => (
            <label key={permission} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={(user.permissions as Permission[]).includes(
                  permission,
                )}
                onChange={() =>
                  setUserPermissions.mutate({
                    userId: user.id,
                    permissions: togglePermission(
                      user.permissions as Permission[],
                      permission,
                    ),
                  })
                }
              />
              {permission}
            </label>
          ))}
        </div>
      ),
    },
    {
      header: "Created",
      cell: (user) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      header: "Password",
      cell: (user) => (
        <SetPasswordControl
          onSubmit={(pw) =>
            setPasswordMutation.mutate({ userId: user.id, password: pw })
          }
        />
      ),
    },
  ];

  return (
    <div className="mt-4 flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="bg-primary text-secondary inline-flex items-center gap-2 self-start rounded-[8px] px-4 py-2 font-semibold"
      >
        <Plus size={16} aria-hidden="true" />
        Add user
      </button>

      <DataTable
        columns={columns}
        rows={users ?? []}
        isLoading={isLoading}
        loadingLabel="Loading users..."
        emptyIcon={Users}
        emptyTitle="No users yet"
        emptyDescription="Create a user to get started."
      />

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create user"
      >
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            createUser.mutate({ username, password, permissions });
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            Username
            <input
              className="border-accent rounded-[8px] border px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Password
            <input
              type="password"
              className="border-accent rounded-[8px] border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          <fieldset className="flex flex-col gap-1 text-sm">
            <legend>Permissions</legend>
            {PERMISSION_VALUES.map((permission) => (
              <label key={permission} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={permissions.includes(permission)}
                  onChange={() =>
                    setPermissions((prev) =>
                      togglePermission(prev, permission),
                    )
                  }
                />
                {permission}
              </label>
            ))}
          </fieldset>
          {createError && (
            <p className="text-sm text-red-600">{createError}</p>
          )}
          <button
            type="submit"
            disabled={createUser.isPending}
            className="bg-primary text-secondary self-start rounded-[8px] px-4 py-2 font-semibold disabled:opacity-50"
          >
            {createUser.isPending ? "Creating..." : "Create user"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
