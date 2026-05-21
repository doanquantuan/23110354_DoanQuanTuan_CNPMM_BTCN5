import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "../store/slices/toastSlice";
import { getUserApi } from "../util/api";
import Table from "../components/ui/Table";

const UserPage = () => {
  const dispatch = useDispatch();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await getUserApi();
        if (res && !res.message) {
          setDataSource(res);
        } else {
          dispatch(
            showToast({
              type: "error",
              title: "LỖI TẢI DỮ LIỆU",
              description: res?.message || "Không thể tải danh sách thành viên",
            })
          );
        }
      } catch (err) {
        console.error("Lỗi khi tải thành viên:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [dispatch]);

  const columns = [
    {
      title: "Id",
      dataIndex: " id",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            role === "ADMIN"
              ? "bg-purple-100 text-purple-800"
              : role === "USER"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {role || "USER"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left animate-slide-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Danh sách thành viên</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách tất cả các tài khoản được đăng ký trên hệ thống.</p>
        </div>
      </div>
      <Table dataSource={dataSource} columns={columns} loading={loading} rowKey="_id" />
    </div>
  );
};

export default UserPage;
