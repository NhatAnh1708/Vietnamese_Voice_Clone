"use client";

export default function ProfileDropdown() {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200">
      <div className="py-1">
        <a
          href="#"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Your Profile
        </a>
        <a
          href="#"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Settings
        </a>
        <a
          href="#"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Sign out
        </a>
      </div>
    </div>
  );
}