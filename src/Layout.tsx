import { Suspense, useEffect } from "react";
import { useAtom } from "jotai";
import { Outlet, useNavigate } from "react-router-dom";
import { VisuallyHidden } from "radix-ui";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { NavBar } from "@/features/layout/NavBar";
import { SideBar } from "@/features/layout/SideBar";
import ThemedSuspense from "@/features/ThemedSuspense";
import { initializeWebSocket, closeWebSocket } from "@/store/websocketManager";
import { useAuthReducer } from "@/atoms/auth";
import { getToken } from "@/apis/auth";
import { drawerOpenAtom } from "@/atoms/layout";

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useAtom(drawerOpenAtom);
  const {
    auth: { token },
  } = useAuthReducer();
  const { login, logout } = useAuthReducer();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      initializeWebSocket(token);
      getToken(token)
        .then((response) => {
          login(response.data);
        })
        .catch((error) => {
          if (error.response?.status === 401) {
            logout();
            navigate("/login");
          } else {
            console.log(error);
          }
        });
    }
    return () => {
      closeWebSocket();
    };
  }, [token]);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar - fixed */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col border-r border-border">
        <SideBar />
      </aside>

      {/* Mobile sidebar - Sheet overlay */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-60 p-0" showCloseButton={false}>
          <VisuallyHidden.Root>
            <SheetTitle>Navigation</SheetTitle>
          </VisuallyHidden.Root>
          <SideBar onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <NavBar />
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<ThemedSuspense />}>
            <div className="flex w-full flex-col items-center">
              <div className="container p-4 md:p-6">
                <Outlet />
              </div>
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
