import { PenSquare } from "lucide-react";

export default function UserInfo() {
  return (
    <div className="flex items-center ">
      <div className="flex-1 flex gap-4 items-center">
        <div className="avatar placeholder">
          <div className="bg-neutral-focus text-neutral-content rounded-full w-20">
            <img src="https://github.com/shadcn.png" alt="" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Rafiqur Rahman</h2>
          <span className="text-base-content/70">Team Manager</span>
          <p className="text-sm text-base-content/50">Leeds, United Kingdom</p>
        </div>
      </div>
      <button className="btn btn-ghost btn-sm">
        Edit
        <PenSquare className="w-4 h-4" />
      </button>
    </div>
  );
}
