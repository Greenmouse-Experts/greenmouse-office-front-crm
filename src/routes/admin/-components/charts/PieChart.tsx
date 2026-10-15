import SimpleContainer from "@/components/SimpleContainer";
import { PieChart, Pie, Cell } from "recharts";

// #region Sample data

const data02 = [
  {
    name: "Users",
    value: 2400,
    color: "#8884d8",
  },
  {
    name: "Products",
    value: 4567,
    color: "#83a6ed",
  },
  {
    name: "Expenses",
    value: 1398,
    color: "#8dd1e1",
  },
  {
    name: "Revenue",
    value: 9800,
    color: "#82ca9d",
  },
  {
    name: "Marketing",
    value: 3908,
    color: "#a4de6c",
  },
];

// #endregion
export const PieChartExample = ({
  isAnimationActive = true,
}: {
  isAnimationActive?: boolean;
}) => (
  <div className="space-y-4 h-fit  ">
    {/*<h2 className="text-md font-semibold">User Analytics</h2>
    <div className="flex gap-2 text-xs flex-wrap">
      {data02.map((item, index) => (
        <div key={index} className="flex items-center  ">
          <div
            className="w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.name}</span>
        </div>
      ))}
    </div>*/}
    {/*<PieChart
      style={{
        width: "100%",
        // maxWidth: "500px",
        height: "100%",
        // aspectRatio: 1,
      }}
      className="flex-1"
      responsive
      margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
    >
      <Pie
        data={data02}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        innerRadius="40%"
        outerRadius="80%"
        // fill="#82ca9d"
        label
        isAnimationActive={isAnimationActive}
        stroke="#fff" // Add a white stroke to create gaps
        strokeWidth={4} // Adjust stroke width for desired gap size
      >
        {data02.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>*/}

    <SimpleContainer title="User Analytics">
      <div className="ring ring-current/20 rounded-b-box p-4">
        <div className="flex gap-2 text-xs flex-wrap">
          {data02.map((item, index) => (
            <div key={index} className="flex items-center  ">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
        <PieChart
          style={{
            width: "100%",
            // maxWidth: "500px",
            height: "100%",
            // aspectRatio: 1,
          }}
          className="flex-1"
          responsive
          margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
        >
          <Pie
            data={data02}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="80%"
            // fill="#82ca9d"
            label
            isAnimationActive={isAnimationActive}
            stroke="#fff" // Add a white stroke to create gaps
            strokeWidth={4} // Adjust stroke width for desired gap size
          >
            {data02.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </div>
    </SimpleContainer>
  </div>
);

export default PieChartExample;
