import React from "react";
import { Clock, Plus, Bookmark, Vote, LucideIcon } from "lucide-react";

type Props = {
  route: string;
  navigate: (path: string) => void;
};

export default function BottomNav({ route, navigate }: Props) {
  const Item = ({
    label,
    path,
    icon: Icon,
  }: {
    label: string;
    path: string;
    icon?: LucideIcon;
  }) => (
    <button
      onClick={() => navigate(path)}
      className={`flex flex-col items-center justify-center flex-1 py-3 ${route === path ? "text-blue-600" : "text-gray-600"}`}
    >
      {Icon ? <Icon size={20} /> : <div className="bg-current rounded-full w-5 h-5" />}
      <span className="mt-1 text-xs">{label}</span>
    </button>
  );

  return (
    <nav className="bottom-0 fixed inset-x-0 flex bg-white border-gray-200 border-t">
      <Item label="recents" path="/recents" icon={Clock} />
      <Item label="saved" path="/saved" icon={Bookmark} />
    </nav>
  );
}
