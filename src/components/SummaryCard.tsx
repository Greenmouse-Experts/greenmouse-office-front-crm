export default function SummaryCard({
  item,
}: {
  item: {
    title: string;
    value: any;
  };
}) {
  return (
    <div>
      <div
        key={item.title}
        className="bg-base-100 shadow-md ring ring-current/10 rounded-box"
      >
        <div className="stat">
          <div className="fieldset-label text-sm">{item.title}</div>
          <div className="stat-value">{item.value}</div>
        </div>
      </div>
    </div>
  );
}
