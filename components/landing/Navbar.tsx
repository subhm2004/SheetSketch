"use client";

import { useState } from "react";
import { Menu, MenuItem } from "../ui/navbar-menu";

export default function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className={className}>
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="Features" href="#features" />
        <MenuItem setActive={setActive} active={active} item="How to use" href="#how-to-use" />
        <MenuItem setActive={setActive} active={active} item="Testimonials" href="#testimonials" />
        <MenuItem setActive={setActive} active={active} item="FAQ" href="#FAQs" />
      </Menu>
    </div>
  );
}
