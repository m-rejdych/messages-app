import { type FC, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { MdMenu, MdNotifications } from 'react-icons/md';

import Menu from '../../components/common/menu';
import type { Item } from '../../types/common/menu';

enum MenuItemValue {
  Logout,
  Profile,
}

const MENU_ITEMS: Item<MenuItemValue>[] = [
  {
    label: 'Profile',
    value: MenuItemValue.Profile,
  },
  {
    label: 'Logout',
    value: MenuItemValue.Logout,
  },
];

const NavBar: FC = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuItemClick = async (value: MenuItemValue): Promise<void> => {
    try {
      switch (value) {
        case MenuItemValue.Logout:
          await signOut();
          break;
        case MenuItemValue.Profile:
          await router.push('/app/profile');
          break;
        default:
          break;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="navbar h-16 bg-base-100 fixed top-0 left-0 right-0 shadow-lg">
      <div className="navbar-start">
        <Menu
          open={menuOpen}
          onItemClick={handleMenuItemClick}
          items={MENU_ITEMS}
        >
          <label
            tabIndex={0}
            className="btn btn-ghost btn-circle"
            onClick={() => setMenuOpen((prev) => !prev)}
            onBlur={() => setMenuOpen(false)}
          >
            <MdMenu className="text-2xl" />
          </label>
        </Menu>
      </div>
      <div className="navbar-center">
        <Link href="/app" className="btn btn-ghost normal-case text-xl">
          Messages App
        </Link>
      </div>
      <div className="navbar-end">
        <button className="btn btn-ghost btn-circle">
          <div className="indicator">
            <MdNotifications className="text-2xl" />
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default NavBar;
