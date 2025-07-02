import { Menu } from "lucide-react";
import { SheetContent } from "../ui/sheet";
import React, { useEffect, useState } from "react";
import { Sheet, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import AdminSideBar from "./admin-side-bar";

const AdminMobileSidebar = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0">
        <AdminSideBar forceMobileExpanded={true} />
      </SheetContent>
    </Sheet>
  );
};

export default AdminMobileSidebar;
