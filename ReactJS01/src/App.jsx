import { Outlet } from "react-router-dom";
import Header from "./components/layout/header";
import Footer from "./components/layout/Footer";
import axios from "./util/axios.customize";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setAuth, setAppLoading } from "./store/slices/authSlice";
import Spinner from "./components/ui/Spinner";

function App() {
  const dispatch = useDispatch();
  const appLoading = useSelector((state) => state.auth.appLoading);

  useEffect(() => {
    const fetchAccount = async () => {
      dispatch(setAppLoading(true));
      try {
        const res = await axios.get(`/v1/api/user`);
        if (res && !res.message) {
          dispatch(
            setAuth({
              isAuthenticated: true,
              user: {
                email: res.email,
                name: res.name,
              },
            })
          );
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin tài khoản:", err);
      } finally {
        dispatch(setAppLoading(false));
      }
    };

    fetchAccount();
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-bakery-bg/5">
      {appLoading === true ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
          <div className="flex flex-col items-center space-y-4">
            <Spinner size="lg" />
            <span className="text-gray-500 font-semibold tracking-wide">Đang đồng bộ dữ liệu...</span>
          </div>
        </div>
      ) : (
        <>
          <Header />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
            <Outlet />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
