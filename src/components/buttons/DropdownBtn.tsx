interface DropDownProps {
  title?: string;
  items: { name: string; action: (item: any) => any }[];
}

export default function DropDownBtn(props: DropDownProps) {
  return (
    <div>
      <div className="dropdown ">
        <button className="btn btn-primary  btn-outline">
          {props.title ?? "Title"}
        </button>
        <ul className="dropdown-content menu -mx-12 min-w-32 ring rounded-box ring-current/10  bg-base-200/50 backdrop-blur-md shadow ">
          {props.items.map((item) => (
            <li key={item.name}>
              <a onClick={() => item.action(item)}>{item.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
