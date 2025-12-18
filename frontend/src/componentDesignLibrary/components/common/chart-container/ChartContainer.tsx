import * as React from "react"
import { Card } from "../../common/card"
import { cn } from "../../../../lib/utils"
import type { ChartContainerProps } from "./types"

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  children,
  className,
}) => (
  <Card className={cn("chart-container flex-shrink-0 w-96 p-3", className)}>
    <div className="mb-2">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <div className="chart-content">{children}</div>
  </Card>
)

const MemoizedChartContainer = React.memo(ChartContainer)
MemoizedChartContainer.displayName = "ChartContainer"

export { MemoizedChartContainer as ChartContainer }