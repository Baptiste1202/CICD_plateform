import { axiosConfig } from "@/config/axiosConfig";
import { useState } from "react";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { Dialog, DialogHeader, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { UserForm } from "./userForm";
import { UserInterface } from "@/interfaces/User";
import { DataTable } from "@/components/customs/dataTable";
import { useTranslation } from "react-i18next";
import {UsersIcon} from "lucide-react";

export const Users = () => {
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [action, setAction] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserInterface>();
  const [userCount, setUserCount] = useState(0);

  const { t } = useTranslation();

  async function fetchUsers(page: number = 0, size: number = 10) {
    setLoading(true);
    try {
      const response = await axiosConfig.get(`/users?page=${page}&size=${size}`);
      setUsers(response.data.users);
      setUserCount(response.data.count);
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "Error fetching users"));
    } finally {
      setLoading(false);
    }
  }

  const handleAction = (type: string, userId?: string) => {
    setAction(type);
    if (userId) {
      setSelectedUser(users.find((u) => u._id === userId));
    } else {
      setSelectedUser(undefined);
    }
    setOpenDialog(true);
  };

  return (
      <div className="flex flex-1 flex-col gap-8 p-8 bg-background">
        <div className="flex items-center justify-between border-b-2 border-border pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black uppercase tracking-tight italic">
                {t("pages.admin.users")}
              </h1>
              <UsersIcon className="w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              {t("pages.admin.users_page.subtitle") || "Manage user accounts and access levels"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border-2 border-border bg-card overflow-hidden shadow-none transition-all">
          <DataTable
              columns={getColumns(handleAction, t)}
              data={users}
              dataCount={userCount}
              fetchData={fetchUsers}
              isLoading={loading}
              callback={handleAction}
              searchElement="username"
              actions={[]}
          />
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[425px] border-2 border-border rounded-2xl bg-background shadow-2xl">
            <DialogHeader className="border-b border-border pb-4 mb-4">
              <DialogTitle className="text-xl font-black uppercase tracking-tighter italic">
                {t(`pages.admin.users_page.actions_type.${action}`)} {t("pages.admin.users_page.a_user")}
              </DialogTitle>
            </DialogHeader>
            <UserForm dialog={setOpenDialog} refresh={fetchUsers} action={action} user={selectedUser} />
          </DialogContent>
        </Dialog>
      </div>
  );
};