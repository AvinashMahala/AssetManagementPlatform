import * as React from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type {
  BaseChartProps,
  PaymentCollectionChartProps,
  PieChartProps,
  ComparisonChartProps,
} from "./types"

// Revenue Trend Chart (Line Chart)
export const RevenueTrendChart: React.FC<BaseChartProps> = ({
  data,
  height = 300,
  colors = ["#3b82f6", "#10b981", "#f59e0b"],
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
        />
        <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={colors[0]}
          strokeWidth={2}
          dot={{ fill: colors[0], r: 4 }}
          activeDot={{ r: 6 }}
          name="Revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Occupancy Rate Chart (Area Chart)
export const OccupancyRateChart: React.FC<BaseChartProps> = ({
  data,
  height = 300,
  colors = ["#3b82f6"],
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3} />
            <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: any) => `${value}%`}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={colors[0]}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorOccupancy)"
          name="Occupancy Rate"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// Payment Collection Chart (Bar Chart)
export const PaymentCollectionChart: React.FC<PaymentCollectionChartProps> = ({
  data,
  height = 300,
  colors = ["#10b981", "#ef4444"],
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
        />
        <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <Bar
          dataKey="collected"
          fill={colors[0]}
          name="Collected"
          radius={[8, 8, 0, 0]}
        />
        <Bar
          dataKey="pending"
          fill={colors[1]}
          name="Pending"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Property Status Chart (Pie Chart)
export const PropertyStatusChart: React.FC<PieChartProps> = ({
  data,
  height = 300,
  colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: any) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Multi-line Comparison Chart
export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  dataKeys,
  height = 300,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
        />
        <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        {dataKeys.map((dk) => (
          <Line
            key={dk.key}
            type="monotone"
            dataKey={dk.key}
            stroke={dk.color}
            strokeWidth={2}
            dot={{ fill: dk.color, r: 4 }}
            activeDot={{ r: 6 }}
            name={dk.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}