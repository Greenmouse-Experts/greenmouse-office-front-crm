import {
  Area,
  AreaChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// #region Sample data
const generateMonthlyData = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const data = [];
  for (let i = 0; i < months.length; i++) {
    data.push({
      name: months[i],
      price: Math.floor(Math.random() * 5000) + 1000, // Random price between 1000 and 6000
    });
  }
  return data;
};

const data = generateMonthlyData();

// #endregion
const AreaChartExample = ({ isAnimationActive = true }) => (
  <AreaChart
    style={{
      width: "100%",
      // maxWidth: "700px",
      maxHeight: "70vh",
      aspectRatio: 1.618,
      fontSize: "0.75rem", // Reduced base font size
    }}
    responsive
    data={data}
    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
  >
    <defs>
      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
      </linearGradient>
    </defs>
    {/*<CartesianGrid strokeDasharray="3 3" />*/}
    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
    <YAxis width="auto" tick={{ fontSize: 10 }} />
    <Tooltip wrapperStyle={{ fontSize: 10 }} />
    <Area
      type="monotone"
      dataKey="price"
      stroke="#8884d8"
      fillOpacity={1}
      fill="url(#colorPrice)"
      isAnimationActive={isAnimationActive}
    />
  </AreaChart>
);

export default AreaChartExample;
