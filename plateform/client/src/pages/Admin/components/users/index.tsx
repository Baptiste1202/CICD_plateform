import { axiosConfig } from "@/config/axiosConfig";
import { useState } from "react";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { Dialog, DialogHeader, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { UserForm } from "./userForm";
import { UserInterface } from "@/interfaces/User";
import { DataTable } from "@/components/customs/dataTable";
import { useTranslation } from "react-i18next";

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
      <div className="py-6">
        <div className="container px-4 mx-auto">
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="capitalize">
                {t(`pages.admin.users_page.actions_type.${action}`)} {t("pages.admin.users_page.a_user")}
              </DialogTitle>
            </DialogHeader>
            <UserForm dialog={setOpenDialog} refresh={fetchUsers} action={action} user={selectedUser} />
          </DialogContent>
        </Dialog>
      </div>
  );
};