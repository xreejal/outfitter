import React from "react";

type Props = {
  route: string;
  navigate: (path: string) => void;
};

export default function BottomNav({ route, navigate }: Props) {
  const Item = ({
    label,
    path,
    icon,
  }: {
    label: string;
    path: string;
    icon?: string;
  }) => (
    <button
      onClick={() => navigate(path)}
      className={`flex flex-col items-center justify-center flex-1 py-3 ${route === path ? "text-blue-600" : "text-gray-600"}`}
    >
      <span className="text-xl">{icon ?? "•"}</span>
      <span className="text-xs">{label}</span>
    </button>
  );

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex">
      <Item label="recents" path="/recents" />
      <Item label="create" path="/create" icon="+" />
      <Item label="saved" path="/saved" icon="🔖" />
      <Item label="vote" path="/vote" icon="⚔️" />
    </nav>
  );
}
