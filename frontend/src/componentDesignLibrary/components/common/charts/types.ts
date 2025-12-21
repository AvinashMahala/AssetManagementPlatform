export interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}

export interface BaseChartProps {
  data: ChartData[]
  height?: number
  colors?: string[]
}

export interface PaymentCollectionData {
  name: string
  collected: number
  pending: number
}

export interface PaymentCollectionChartProps {
  data: PaymentCollectionData[]
  height?: number
  colors?: string[]
}

export interface PieChartProps extends BaseChartProps {
  colors?: string[]
}

export interface ComparisonChartProps extends BaseChartProps {
  dataKeys: { key: string; name: string; color: string }[]
}