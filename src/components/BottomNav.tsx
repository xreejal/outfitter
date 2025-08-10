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
      {Icon ? <Icon size={20} /> : <div className="w-5 h-5 rounded-full bg-current" />}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex">
      <Item label="recents" path="/recents" icon={Clock} />
      <Item label="create" path="/create" icon={Plus} />
      <Item label="saved" path="/saved" icon={Bookmark} />
      <Item label="vote" path="/vote" icon={Vote} />
    </nav>
  );
}
